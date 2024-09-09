// Create new tab
import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import supabase from "@/common/data/database/supabase/clients/server";
import {
  isSignable,
  Signable,
  SignedFile,
  validateSignable,
} from "@/common/lib/signedFiles";
import { NextApiRequest, NextApiResponse } from "next/types";
import { identityCanModifySpace } from "./[tabId]";
import stringify from "fast-json-stable-stringify";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import moment from "moment";
import { isNull } from "lodash";

export type RegisterNewSpaceTabResponse = NounspaceResponse<string>;

type SpaceTabRegistration = {
  identityPublicKey: string;
  timestamp: string;
  spaceId: string;
  tabName: string;
} & Signable;

function isSpaceTabRegistration(thing: unknown): thing is SpaceTabRegistration {
  return (
    isSignable(thing) &&
    typeof thing["identityPublicKey"] === "string" &&
    typeof thing["timestamp"] === "string" &&
    typeof thing["tabName"] === "string" &&
    typeof thing["spaceId"] === "string"
  );
}

// Handles the registration of a new space tab to requesting identity
async function registerNewSpaceTab(
  req: NextApiRequest,
  res: NextApiResponse<RegisterNewSpaceTabResponse>,
) {
  const registration = req.body;
  if (!isSpaceTabRegistration(registration)) {
    res.status(400).json({
      result: "error",
      error: {
        message:
          "Registration of a new tab requires identityPublicKey, timestamp, spaceId, tabName, and signature",
      },
    });
    return;
  }
  if (registration.spaceId !== req.query.spaceId) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Space ID in url must match one in request",
      },
    });
    return;
  }
  // TODO: check that timestamp is recent (1 minute? 5 minutes?)
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
    !(await identityCanModifySpace(
      registration.identityPublicKey,
      registration.spaceId,
    ))
  ) {
    res.status(400).json({
      result: "error",
      error: {
        message: `Identity ${registration.identityPublicKey} cannot manage space ${registration.spaceId}`,
      },
    });
    return;
  }
  // TO DO: Check that the user can register more tabs
  // Currently we are allowing unlimited files on server side

  const uploadedFile: SignedFile = {
    fileData: stringify(INITIAL_SPACE_CONFIG_EMPTY),
    fileType: "json",
    isEncrypted: false,
    timestamp: moment().toISOString(),
    // TO DO: Create a Nounspace signer and use it verify our files
    // This will allow us to do client side validation better
    // Current this is insecure to a man in the middle attack
    publicKey: "nounspace",
    signature: "not applicable, machine generated file",
  };
  const { error } = await supabase.storage
    .from("public")
    .upload(
      `${registration.spaceId}/tabs/${registration.tabName}`,
      new Blob([stringify(uploadedFile)], { type: "application/json" }),
    );
  if (!isNull(error)) {
    console.error(error);
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
    value: registration.tabName,
  });
}

export default requestHandler({
  post: registerNewSpaceTab,
});
