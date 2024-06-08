import { NextApiRequest, NextApiResponse } from "next";
import supabase from "@/common/data/database/supabase/clients/server";
import { SignedFile, hashObject } from "@/common/data/stores/accounts";
import { rootKeyPath } from "@/constants/supabase";
import { isUndefined } from "lodash";
import { secp256k1 } from "@noble/curves/secp256k1";
import stringify from "fast-json-stable-stringify";

export interface UnsignedIdentityRequest {
  type: "Create" | "Revoke";
  identityPublicKey: string;
  walletAddress: string;
  nonce: string;
  timestamp: string;
}

export interface IdentityRequest extends UnsignedIdentityRequest {
  signature: string;
}

interface IdentityResponseError {
  message: string;
}

export type IndentityResponse = {
  result: "error" | "success";
  value?: IdentityRequest | IdentityRequest[];
  error?: IdentityResponseError;
};

function validateRequestSignature(req: IdentityRequest) {
  const message = hashObject({
    ...req,
    signature: undefined,
  });
  return secp256k1.verify(req.signature, message, req.identityPublicKey, {
    prehash: true,
  });
}

function validateFileSignature(f: SignedFile) {
  return secp256k1.verify(
    f.signature,
    hashObject({ ...f, signature: undefined }),
    f.publicKey,
    { prehash: true },
  );
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<IndentityResponse>,
) {
  try {
    const { file, identityRequest } = req.body as {
      file?: SignedFile;
      identityRequest: IdentityRequest;
    };
    if (!validateRequestSignature(identityRequest)) {
      throw Error("Invalid signature on request");
    }
    if (identityRequest.type === "Create" && !isUndefined(file)) {
      if (!validateFileSignature(file)) {
        throw Error("Invalid signature on keys file");
      }
      const { error } = await supabase
        .from("walletIdentities")
        .insert(identityRequest);
      if (error) {
        throw error;
      }
      const { error: storageError } = await supabase.storage
        .from("private")
        .upload(
          rootKeyPath(
            identityRequest.identityPublicKey,
            identityRequest.walletAddress,
          ),
          new Blob([stringify(file)], { type: "application/json" }),
        );
      if (storageError) {
        throw storageError;
      }
    }
    res.status(200).json({
      result: "success",
      value: identityRequest,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      result: "error",
      error: {
        message: "Malformed POST request",
      },
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<IndentityResponse>,
) {
  const query = req.query;
  if (query.address) {
    const { data, error } = await supabase
      .from("walletIdentities")
      .select()
      .eq("walletAddress", query.address);
    if (error) {
      res.status(500).json({
        result: "error",
        error: {
          message: error.message,
        },
      });
    } else {
      res.status(200).json({
        result: "success",
        value: data,
      });
    }
  } else {
    res.status(400).json({
      result: "error",
      error: {
        message: "Must provide `address` in the query",
      },
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IndentityResponse>,
) {
  if (req.method === "GET") {
    await handleGet(req, res);
  } else if (req.method === "POST") {
    await handlePost(req, res);
  } else {
    res.status(405).json({
      result: "error",
      error: {
        message: "Only GET and POST are allowed",
      },
    });
  }
}
