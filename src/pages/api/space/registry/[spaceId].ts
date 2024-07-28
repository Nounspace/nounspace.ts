import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import {
  SignedFile,
  isSignedFile,
  validateSignable,
} from "@/common/lib/signedFiles";
import { findIndex, first, isObject, isString, isUndefined, map } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";
import supabase from "@/common/data/database/supabase/clients/server";
import stringify from "fast-json-stable-stringify";

// TO DO: Support setting default space for an FID
// TO DO: Add object validation with Zod (https://zod.dev/)

export type NameChangeRequest = {
  newName: string;
  publicKey: string;
  timestamp: string;
  signature: string;
};

function isNameChangeRequest(maybe: unknown): maybe is NameChangeRequest {
  if (!isObject(maybe)) {
    return false;
  }
  return (
    typeof maybe["newName"] === "string" &&
    typeof maybe["publicKey"] === "string" &&
    typeof maybe["timestamp"] === "string" &&
    typeof maybe["signature"] === "string"
  );
}

export type UpdateSpaceRequest = {
  spaceConfig?: SignedFile;
  name?: NameChangeRequest;
};

type UpdateSpaceResponseData = {
  name: string;
  spaceId: string;
};

export type UpdateSpaceResponse = NounspaceResponse<UpdateSpaceResponseData>;

async function getFidForSpaceId(spaceId: string) {
  const { data } = await supabase
    .from("spaceRegistrations")
    .select("fid")
    .eq("spaceId", spaceId);
  return data !== null ? first(data)?.fid : undefined;
}

async function identitiesCanModifySpace(spaceId: string) {
  const { data } = await supabase
    .from("fidRegistrations")
    .select(
      `
    fid,
    identityPublicKey,
    spaceRegistrations!inner (
      fid
    )`,
    )
    .eq("spaceRegistrations.spaceId", spaceId);
  return data === null ? [] : map(data, (d) => d.identityPublicKey);
}

async function identityCanModifySpace(identity: string, spaceId: string) {
  const data = await identitiesCanModifySpace(spaceId);
  return findIndex(data, (i) => i === identity) !== -1;
}

function updateSpaceRegistration(spaceId: string, request: NameChangeRequest) {
  return supabase
    .from("spaceRegistrations")
    .update({
      spaceName: request.newName,
      signature: request.signature,
      identityPublicKey: request.publicKey,
      timestamp: request.timestamp,
    })
    .eq("spaceId", spaceId)
    .select();
}

function loadSpaceRegistration(spaceId: string) {
  return supabase.from("spaceRegistrations").select().eq("spaceId", spaceId);
}

async function updateName(
  spaceId: string,
  req: Partial<NameChangeRequest>,
): Promise<NounspaceResponse<string>> {
  if (!isNameChangeRequest(req)) {
    return {
      result: "error",
      error: {
        message:
          "Must provide newName, identityPublicKey, timestamp, and signature to update a Space Name",
      },
    };
  }
  if (!(await identityCanModifySpace(req.publicKey, spaceId))) {
    return {
      result: "error",
      error: {
        message: `Identity ${req.publicKey} cannot update space ${spaceId}`,
      },
    };
  }
  if (!validateSignable(req)) {
    return {
      result: "error",
      error: {
        message: "Invalid signature on request",
      },
    };
  }
  const fid = await getFidForSpaceId(spaceId);
  if (isUndefined(fid)) {
    return {
      result: "error",
      error: {
        message: `Couldn't find fid for space ${spaceId}`,
      },
    };
  }
  const { data: existingRegistrations } = await supabase
    .from("spaceRegistrations")
    .select("spaceId")
    .eq("fid", fid)
    .eq("spaceName", req.newName);
  if (existingRegistrations && existingRegistrations.length > 0) {
    return {
      result: "error",
      error: {
        message: `fid ${fid} already has a space named ${req.newName}`,
      },
    };
  }
  const { data, error } = await updateSpaceRegistration(spaceId, req);
  if (data === null) {
    return {
      result: "error",
      error: {
        message: error.message,
      },
    };
  }
  return {
    result: "success",
    value: first(data)?.spaceName,
  };
}

async function updateConfig(
  spaceId: string,
  req: Partial<SignedFile>,
): Promise<NounspaceResponse<boolean>> {
  if (!isSignedFile(req)) {
    return {
      result: "error",
      error: {
        message:
          "Config must contain publicKey, fileData, fileType, isEncrypted, and timestamp",
      },
    };
  }
  if (!validateSignable(req)) {
    return {
      result: "error",
      error: {
        message: "Invalid signature",
      },
    };
  }
  if (!(await identityCanModifySpace(req.publicKey, spaceId))) {
    return {
      result: "error",
      error: {
        message: `Identity ${req.publicKey} cannot update space ${spaceId}`,
      },
    };
  }
  const { error } = await supabase.storage
    .from("spaces")
    .upload(spaceId, new Blob([stringify(req)], { type: "application/json" }), {
      upsert: true,
    });
  if (error) {
    return {
      result: "error",
      error: {
        message: error.message,
      },
    };
  }
  return {
    result: "success",
    value: true,
  };
}

// Handles updating the space
// Verifies that the signature is valid
// And the identity requesting is allowed to update
async function updateSpace(
  req: NextApiRequest,
  res: NextApiResponse<UpdateSpaceResponse>,
) {
  const spaceId = req.query.spaceId as string;
  const request: UpdateSpaceRequest = req.body;
  let updateNameResult;
  if (request.name) {
    updateNameResult = updateName(spaceId, request.name);
  }
  let updateConfigResult;
  if (request.spaceConfig) {
    updateConfigResult = updateConfig(spaceId, request.spaceConfig);
  }
  const { data } = await loadSpaceRegistration(spaceId);
  let value;
  if (data !== null) {
    value = {
      spaceId,
      name: first(data)?.spaceName,
    } as UpdateSpaceResponseData;
  }
  res.status(200).json({
    result: "success",
    error: {
      name: updateNameResult ? updateNameResult.error : undefined,
      spaceConfig: updateConfigResult ? updateConfigResult.error : undefined,
    },
    value,
  });
}

async function spacePublicKeys(req: NextApiRequest, res: NextApiResponse) {
  const spaceId = req.query.spaceId;
  if (isString(spaceId)) {
    res.status(200).json(await identitiesCanModifySpace(spaceId));
  } else {
    res.status(400);
  }
}

export default requestHandler({
  post: updateSpace,
  get: spacePublicKeys,
});
