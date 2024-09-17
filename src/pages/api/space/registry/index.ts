import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { isSignable, validateSignable } from "@/common/lib/signedFiles";
import { findIndex, first, isArray, isUndefined } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";

export type SpaceRegistration = {
  spaceName: string;
  identityPublicKey: string;
  fid: number;
  signature: string;
  timestamp: string;
};

type SpaceInfo = SpaceRegistration & {
  spaceId: string;
};

function isSpaceRegistration(maybe: unknown): maybe is SpaceRegistration {
  if (!isSignable(maybe, "identityPublicKey")) {
    return false;
  }
  return (
    typeof maybe["spaceName"] === "string" &&
    typeof maybe["fid"] === "number" &&
    typeof maybe["timestamp"] === "string"
  );
}

export type RegisterNewSpaceResponse = NounspaceResponse<SpaceInfo>;

export type ModifiableSpacesResponse = NounspaceResponse<{
  identity: string;
  spaces: SpaceInfo[];
}>;

async function identityCanRegisterForFid(identity: string, fid: number) {
  const { data } = await supabaseClient
    .from("fidRegistrations")
    .select("fid, identityPublicKey")
    .eq("fid", fid);
  return (
    data !== null &&
    findIndex(data, (i) => i.identityPublicKey === identity) !== -1
  );
}

// Handles the registration of a new space name to requesting identity
// Checks that the identity is allowed to register more than one name
async function registerNewSpace(
  req: NextApiRequest,
  res: NextApiResponse<RegisterNewSpaceResponse>,
) {
  const registration = req.body;
  if (!isSpaceRegistration(registration)) {
    res.status(400).json({
      result: "error",
      error: {
        message:
          "Registration of a new space requires spaceName, fid, timestamp, identityPublicKey, and signature",
      },
    });
    return;
  }
  if (!validateSignable(registration, "identityPublicKey")) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Invalid signature",
      },
    });
    return;
  }
  if (
    !(await identityCanRegisterForFid(
      registration.identityPublicKey,
      registration.fid,
    ))
  ) {
    res.status(400).json({
      result: "error",
      error: {
        message: `Identity ${registration.identityPublicKey} cannot manage spaces for fid ${registration.fid}`,
      },
    });
    return;
  }
  const { data } = await supabaseClient
    .from("spaceRegistrations")
    .select("spaceId")
    .eq("fid", registration.fid)
    .eq("spaceName", registration.spaceName);
  if (data && data.length > 0) {
    res.status(400).json({
      result: "error",
      error: {
        message: `fid ${registration.fid} already has a space named ${registration.spaceName}`,
      },
    });
  }
  const { data: result, error } = await supabaseClient
    .from("spaceRegistrations")
    .insert([registration])
    .select();
  if (error) {
    res.status(500).json({
      result: "error",
      error: {
        message: error.message,
      },
    });
    return;
  }
  res.status(200).json({
    result: "success",
    value: first(result),
  });
}

// Returns a list of the spaces that the requesting identity
// owns and can modify, including updates and renaming
async function listModifiableSpaces(
  req: NextApiRequest,
  res: NextApiResponse<ModifiableSpacesResponse>,
) {
  const identity = req.query.identityPublicKey;
  if (isUndefined(identity) || isArray(identity)) {
    res.status(400).json({
      result: "error",
      error: {
        message:
          "identityPublicKey must be provided as a query parameter with a single value",
      },
    });
    return;
  }
  const { data, error } = await supabaseClient
    .from("spaceRegistrations")
    .select("*, fidRegistrations!inner (fid, identityPublicKey)")
    .filter("fidRegistrations.identityPublicKey", "eq", identity);
  if (error) {
    res.status(500).json({
      result: "error",
      error: {
        message: error.message,
      },
    });
    return;
  }
  res.status(200).json({
    result: "success",
    value: {
      identity,
      spaces: data,
    },
  });
}

export default requestHandler({
  get: listModifiableSpaces,
  post: registerNewSpace,
});
