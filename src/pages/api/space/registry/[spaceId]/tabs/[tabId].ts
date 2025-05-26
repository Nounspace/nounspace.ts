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
import { createSupabaseServerClient } from "@/common/data/database/supabase/clients/server";
import stringify from "fast-json-stable-stringify";
import { identitiesCanModifySpace } from "../../[spaceId]";

export type UnsignedDeleteSpaceTabRequest = {
  publicKey: string;
  timestamp: string;
  spaceId: string;
  tabName: string;
  network?: string;
};

export type DeleteSpaceTabRequest = UnsignedDeleteSpaceTabRequest & Signable;

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
  network?: string,
) {
  // console.log("identityCanModifySpace", identity, spaceId, network);
  const data = await identitiesCanModifySpace(spaceId, network);
  return findIndex(data, (i) => i === identity) !== -1;
}

async function updateSpace(
  incReq: NextApiRequest,
  res: NextApiResponse<NounspaceResponse>,
): Promise<void> {
  const requestBody = incReq.body;
  const spaceId = incReq.query.spaceId as string;
  const tabIdFromQuery = incReq.query.tabId as string; // This is the oldTabName / current tabId

  const network = requestBody.network ? (requestBody.network as string) : undefined;

  // Create the file object for validation and use, excluding 'network'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { network: _network, ...signedFilePayloadUntyped } = requestBody;
  const signedFilePayload = signedFilePayloadUntyped as UpdateSpaceTabRequest;


  if (!isSignedFile(signedFilePayload)) {
    res.status(400).json({
      result: "error",
      error: {
        message:
          "Request body must be a valid SignedFile (publicKey, fileData, fileType, isEncrypted, timestamp, signature).",
      },
    });
    return;
  }

  // Additional checks for UpdateSpaceTabRequest specifics
  if (typeof signedFilePayload.fileName !== 'string') {
    res.status(400).json({
      result: "error",
      error: {
        message: "fileName is missing or not a string in the tab data.",
      },
    });
    return;
  }

  if (signedFilePayload.isEncrypted !== false) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Tab data must not be encrypted (isEncrypted should be false).",
      },
    });
    return;
  }

  if (!validateSignable(signedFilePayload)) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Invalid signature",
      },
    });
    return;
  }

  if (!(await identityCanModifySpace(signedFilePayload.publicKey, spaceId, network))) {
    res.status(400).json({
      result: "error",
      error: {
        message: `Identity ${signedFilePayload.publicKey} cannot update space ${spaceId}`,
      },
    });
    return;
  }

  // tabIdFromQuery is the old/current name from the URL.
  // signedFilePayload.fileName is the new name from the payload.
  if (signedFilePayload.fileName !== tabIdFromQuery) {
    // This means the tab name has changed.
    const supabase = createSupabaseServerClient();
    const { error: moveError } = await supabase.storage
      .from("spaces")
      .move(`${spaceId}/tabs/${tabIdFromQuery}`, `${spaceId}/tabs/${signedFilePayload.fileName}`);
    if (moveError) {
      res.status(500).json({
        result: "error",
        error: {
          message: `Failed to rename tab: ${moveError.message}`,
        },
      });
      return;
    }
  }

  const supabase = createSupabaseServerClient();
  // Always use the (potentially new) fileName from the payload for the update path.
  const { error: updateError } = await supabase.storage
    .from("spaces")
    .update(
      `${spaceId}/tabs/${signedFilePayload.fileName}`,
      new Blob([stringify(signedFilePayload)], { type: "application/json" }),
    );

  if (updateError) {
    res.status(500).json({
      result: "error",
      error: {
        message: updateError.message,
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
  // console.log("deleteReq", deleteReq);
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
  if (
    !(await identityCanModifySpace(
      deleteReq.publicKey,
      spaceId,
      deleteReq.network,
    ))
  ) {
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
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.storage
    .from("spaces")
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
