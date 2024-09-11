// Edit and delete tabs
import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import {
  Signable,
  SignedFile,
  isSignable,
  isSignedFile,
  validateSignable,
} from "@/common/lib/signedFiles";
import { findIndex, isNull } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";
import supabase from "@/common/data/database/supabase/clients/server";
import stringify from "fast-json-stable-stringify";
import { identitiesCanModifySpace } from "../../[spaceId]";

export type DeleteSpaceTabRequest = {
  publicKey: string;
  timestamp: string;
  spaceId: string;
  tabName: string;
} & Signable;

function isDeleteSpaceTabRequest(
  maybe: unknown,
): maybe is DeleteSpaceTabRequest {
  return (
    isSignable(maybe) &&
    typeof maybe["spaceId"] === "string" &&
    typeof maybe["publicKey"] === "string" &&
    typeof maybe["timestamp"] === "string" &&
    typeof maybe["signature"] === "string" &&
    typeof maybe["tabName"] === "string"
  );
}

export type UpdateSpaceTabRequest = SignedFile & {
  isEncrypted: false;
  fileName: string;
};

export async function identityCanModifySpace(
  identity: string,
  spaceId: string,
) {
  const data = await identitiesCanModifySpace(spaceId);
  return findIndex(data, (i) => i === identity) !== -1;
}

async function updateSpace(
  incReq: NextApiRequest,
  res: NextApiResponse<NounspaceResponse>,
): Promise<void> {
  const req = incReq.body;
  const spaceId = incReq.query.spaceId as string;
  const tabName = incReq.query.tabId as string;
  if (!isSignedFile(req)) {
    res.status(400).json({
      result: "error",
      error: {
        message:
          "Config must contain publicKey, fileData, fileType, isEncrypted, and timestamp",
      },
    });
    return;
  }
  if (!validateSignable(req)) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Invalid signature",
      },
    });
    return;
  }
  if (!(await identityCanModifySpace(req.publicKey, spaceId))) {
    res.status(400).json({
      result: "error",
      error: {
        message: `Identity ${req.publicKey} cannot update space ${spaceId}`,
      },
    });
    return;
  }
  if (req.fileName !== tabName) {
    const { error } = await supabase.storage
      .from("public")
      .move(`${spaceId}/tabs/${tabName}`, `${spaceId}/tabs/${req.fileName}`);
    if (error) {
      res.status(500).json({
        result: "error",
        error: {
          message: error.message,
        },
      });
      return;
    }
  }
  const { error } = await supabase.storage
    .from("public")
    .update(
      `${spaceId}/tabs/${req.fileName}`,
      new Blob([stringify(req)], { type: "application/json" }),
    );
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
    value: true,
  });
}

async function deleteSpace(req: NextApiRequest, res: NextApiResponse) {
  const deleteReq = req.body;
  const spaceId = req.query.spaceId as string;
  const tabId = req.query.tabId as string;
  if (!isDeleteSpaceTabRequest(deleteReq)) {
    res.status(400).json({
      result: "error",
      error: {
        message:
          "Must provide newName, identityPublicKey, timestamp, and signature to update a Space Name",
      },
    });
    return;
  }
  if (!(await identityCanModifySpace(deleteReq.publicKey, spaceId))) {
    res.status(400).json({
      result: "error",
      error: {
        message: `Identity ${deleteReq.publicKey} cannot update space ${spaceId}`,
      },
    });
    return;
  }
  if (!validateSignable(deleteReq)) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Invalid signature on request",
      },
    });
    return;
  }
  if (deleteReq.spaceId !== spaceId) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Space ID in request does not match target space's ID",
      },
    });
    return;
  }
  if (deleteReq.tabName !== tabId) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Space ID in request does not match target space's ID",
      },
    });
    return;
  }
  const { error } = await supabase.storage
    .from("public")
    .remove([`${deleteReq.spaceId}/tabs/${deleteReq.tabName}`]);
  if (!isNull(error)) {
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
  });
}

export default requestHandler({
  post: updateSpace,
  delete: deleteSpace,
});
