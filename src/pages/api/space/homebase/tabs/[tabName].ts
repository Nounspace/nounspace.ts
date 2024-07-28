import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import {
  SignedFile,
  isSignedFile,
  validateSignable,
} from "@/common/lib/signedFiles";
import { NextApiRequest, NextApiResponse } from "next/types";
import supabase from "@/common/data/database/supabase/clients/server";
import stringify from "fast-json-stable-stringify";
import { homebasePath } from "@/constants/supabase";
import { findIndex, isArray, isUndefined } from "lodash";
import { listTabsForIdentity } from ".";

export type UpdateHomebaseResponse = NounspaceResponse<boolean>;
export type UpdateHomebaseRequest = SignedFile;

async function updateHomebaseTab(
  req: NextApiRequest,
  res: NextApiResponse<UpdateHomebaseResponse>,
) {
  const file: UpdateHomebaseRequest = req.body;
  const tabName = req.query.tabName;
  if (isUndefined(tabName) || isArray(tabName)) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Tab Name must be a string",
      },
    });
    return;
  }
  if (!isSignedFile(file)) {
    res.status(400).json({
      result: "error",
      error: {
        message:
          "Config must contain publicKey, fileData, fileType, isEncrypted, and timestamp",
      },
    });
    return;
  }
  if (isUndefined(file.fileName) || file.fileName !== tabName) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Filename must be the same as the tab name",
      },
    });
    return;
  }
  if (!validateSignable(file)) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Invalid signature",
      },
    });
    return;
  }
  const tabs = await listTabsForIdentity(file.publicKey);

  if (findIndex(tabs, tabName) === -1) {
    res.status(500).json({
      result: "error",
      error: {
        message: "Tab does not exist",
      },
    });
  }

  const { error } = await supabase.storage
    .from("private")
    .upload(
      `${homebasePath(file.publicKey)}Tabs/${tabName}`,
      new Blob([stringify(file)], { type: "application/json" }),
      {
        upsert: true,
      },
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

export default requestHandler({
  post: updateHomebaseTab,
});
