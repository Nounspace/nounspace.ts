import { APP_FID } from "@/constants/app";
import { AppSigner } from "@/constants/app-server-side";
import { SIGNED_KEY_REQUEST_TYPE, SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN } from "@farcaster/core";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { DeveloperManagedSigner } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { isArray, isUndefined } from "lodash";
import type { NextApiRequest, NextApiResponse } from 'next';

type CreateSignerRequest = {
  publicKey: `0x${string}`;
};

export type SignerResponse<D> = {
  result: "success" | "error";
  error?: {
    message: string;
  };
  value?: D;
};

async function handlePost(req: NextApiRequest, res: NextApiResponse<SignerResponse<DeveloperManagedSigner>>) {
  const { publicKey } = req.body as CreateSignerRequest;

  if (isUndefined(publicKey)) {
    return res.status(400).json({
      result: "error",
      error: {
        message: "No Public Key Provided",
      },
    });
  }

  const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);
  const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
  const signature = await AppSigner.signTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: "SignedKeyRequest",
    message: {
      requestFid: BigInt(APP_FID!),
      key: publicKey,
      deadline: BigInt(deadline),
    },
  });

  try {
    const result = await client.registerSignedKeyForDeveloperManagedSigner(
      publicKey, signature, APP_FID!, deadline,
    );

    return res.status(200).json({
      result: "success",
      value: result,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      result: "error",
      error: {
        message: "An error occurred registering the signer with Neynar",
      },
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const publicKey = req.query.publicKey;

  if (isUndefined(publicKey)) {
    return res.status(400).json({
      result: "error",
      error: {
        message: "No Public Key Provided",
      },
    });
  }

  if (isArray(publicKey)) {
    return res.status(400).json({
      result: "error",
      error: {
        message: "Only provide a single public key",
      },
    });
  }

  const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

  try {
    const result = await client.lookupDeveloperManagedSigner(publicKey);

    return res.status(200).json({
      result: "success",
      value: result,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      error: {
        message: "An error occurred registering the signer with Neynar",
      },
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignerResponse<DeveloperManagedSigner>>
) {
  if (req.method === "POST") {
    return handlePost(req, res);
  } else if (req.method === "GET") {
    return handleGet(req, res);
  } else {
    res.status(405).json({
      result: "error",
      error: {
        message: "Only GET and POST are allowed",
      }
    });
  }
}