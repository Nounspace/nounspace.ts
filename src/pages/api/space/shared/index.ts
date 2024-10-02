import pinata from "@/common/data/api/pinata";
import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { UpdatableSpaceConfig } from "@/common/data/stores/app/space/spaceStore";
import { FidgetInstanceData } from "@/common/fidgets";
import { isSignable, validateSignable } from "@/common/lib/signedFiles";
import { UserTheme } from "@/common/lib/theme";
import { first, includes, isArray, isNil, isObject, isUndefined } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";

export type SharedContentInfo = {
  cid: string;
  publicKey: string;
  name: string | null;
  signature: string; // Only over the name + public key + timestamp
  timestamp: string;
};

interface SharedContentBase {
  author: string;
  signature: string;
}

type SharedTab = SharedContentBase & {
  type: "tab";
  content: UpdatableSpaceConfig;
};

type SharedFidget = SharedContentBase & {
  type: "fidget";
  content: FidgetInstanceData;
};

type SharedTheme = SharedContentBase & {
  type: "theme";
  content: UserTheme;
};

export type SharedContentDetails = SharedTab | SharedFidget | SharedTheme;

export type SharedContentCreationRequest = {
  metadata: Omit<SharedContentInfo, "cid">;
  content: SharedContentDetails;
};

function isSharedContentCreationRequest(
  thing: unknown,
): thing is SharedContentCreationRequest {
  return (
    isObject(thing) &&
    isSignable(thing["metadata"], "publicKey") &&
    isSignable(thing["content"], "author") &&
    typeof thing["metadata"]["name"] === "string" &&
    typeof thing["metadata"]["timestamp"] === "string" &&
    typeof thing["content"]["type"] === "string" &&
    includes(["tab", "fidget", "theme"], thing["content"]["type"]) &&
    typeof thing["content"]["content"] === "object"
  );
}

export type SharedContentResponse = NounspaceResponse<{
  contentInfo: SharedContentInfo;
  contentDetails?: SharedContentDetails;
}>;

async function retrieveSharedContent(
  req: NextApiRequest,
  res: NextApiResponse<SharedContentResponse>,
) {
  const { publicKey, signature, cid } = req.query;

  if (
    isUndefined(publicKey) ||
    isUndefined(signature) ||
    isUndefined(cid) ||
    isArray(signature) ||
    isArray(cid) ||
    isArray(publicKey)
  ) {
    res.status(400).json({
      result: "error",
      error: {
        message: "publicKey, signature, and cid must be provided",
      },
    });
    return;
  }

  if (!validateSignable({ publicKey, cid, signature }, "publicKey")) {
    res.status(400).json({
      result: "error",
      error: {
        message: "signature invalid",
      },
    });
    return;
  }

  try {
    await supabaseClient.from("sharedContentAccessRequests").insert({
      publicKey,
      signature,
      cid,
    });
  } catch (e) {
    console.error(e);
  }

  try {
    const fileData = await pinata.gateways.get(cid);
    const { data: sharingInfo } = await supabaseClient
      .from("sharedContentRegistrations")
      .select()
      .eq("cid", cid);
    if (
      fileData.contentType === "application/json" &&
      !isNil(fileData.data) &&
      !isNil(sharingInfo) &&
      sharingInfo.length > 0
    ) {
      res.status(200).json({
        result: "success",
        value: {
          contentInfo: first(sharingInfo)!,
          contentDetails: fileData.data as unknown as SharedContentDetails,
        },
      });
      return;
    }
    res.status(500).json({
      result: "error",
      error: {
        message: "Invalid file found for this CID",
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      result: "error",
      error: {
        message: "An error occured retrieving this CID",
      },
    });
  }
}

async function createSharedContent(
  req: NextApiRequest,
  res: NextApiResponse<SharedContentResponse>,
) {
  const data = req.body;
  if (!isSharedContentCreationRequest(data)) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Invalid request format",
      },
    });
    return;
  }

  if (data.content.author !== data.metadata.publicKey) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Metadata public key and content author must be the same",
      },
    });
    return;
  }

  if (!validateSignable(data.content, "author")) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Content signature invalid",
      },
    });
    return;
  }

  if (!validateSignable(data.metadata, "publicKey")) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Metadata signature invalid",
      },
    });
    return;
  }

  try {
    const ipfsUploadResp = await pinata.upload.json(data.content);
    await supabaseClient.from("sharedContentRegistrations").insert({
      cid: ipfsUploadResp.cid,
      ...data.metadata,
    });
    res.status(200).json({
      result: "success",
      value: {
        contentInfo: {
          cid: ipfsUploadResp.cid,
          ...data.metadata,
        },
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      result: "error",
      error: {
        message: "An error occurred adding data to shared registry",
      },
    });
  }
}

export default requestHandler({
  get: retrieveSharedContent,
  post: createSharedContent,
});
