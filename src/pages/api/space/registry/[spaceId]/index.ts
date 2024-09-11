import supabase from "@/common/data/database/supabase/clients/server";
import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import {
  isSignable,
  Signable,
  validateSignable,
} from "@/common/lib/signedFiles";
import { isArray, isString, map, isNull } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";
import { identityCanModifySpace } from "./tabs/[tabId]";
import stringify from "fast-json-stable-stringify";

type TabInfo = string[];

export type UnsignedUpdateTabOrderRequest = {
  spaceId: string;
  timestamp: string;
  tabOrder: TabInfo;
  publicKey: string;
};

export type UpdateTabOrderRequest = UnsignedUpdateTabOrderRequest & Signable;

function isUpdateTabOrderRequest(
  thing: unknown,
): thing is UpdateTabOrderRequest {
  return (
    isSignable(thing) &&
    typeof thing["spaceId"] === "string" &&
    typeof thing["timestamp"] === "string" &&
    isArray(thing["tabOrder"]) &&
    typeof thing["publicKey"] === "string"
  );
}

export type UpdateSpaceTabsResponse = NounspaceResponse<TabInfo>;

async function updateSpaceTabOrder(
  req: NextApiRequest,
  res: NextApiResponse<UpdateSpaceTabsResponse>,
) {
  const updateOrderRequest = req.body;
  if (!isUpdateTabOrderRequest(updateOrderRequest)) {
    res.status(400).json({
      result: "error",
      error: {
        message:
          "Updating space tab order requires: spaceId, timestamp, tabOrder, publicKey, and signature",
      },
    });
    return;
  }
  if (!validateSignable(updateOrderRequest)) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Invalid signature",
      },
    });
    return;
  }
  if (updateOrderRequest.spaceId !== req.query.spaceId) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Space ID in url must match one in request",
      },
    });
    return;
  }
  // TODO: check that timestamp is recent (1 minute? 5 minutes?)
  // and is more recent than most recent file uploaded
  if (
    !(await identityCanModifySpace(
      updateOrderRequest.publicKey,
      updateOrderRequest.spaceId,
    ))
  ) {
    res.status(400).json({
      result: "error",
      error: {
        message: `Identity ${updateOrderRequest.publicKey} cannot manage space ${updateOrderRequest.spaceId}`,
      },
    });
    return;
  }
  const { error } = await supabase.storage
    .from("spaces")
    .upload(
      `${updateOrderRequest.spaceId}/tabOrder`,
      new Blob([stringify(updateOrderRequest)], { type: "application/json" }),
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
    value: updateOrderRequest.tabOrder,
  });
}

export async function identitiesCanModifySpace(spaceId: string) {
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

async function spacePublicKeys(req: NextApiRequest, res: NextApiResponse) {
  const spaceId = req.query.spaceId;
  if (isString(spaceId)) {
    res.status(200).json(await identitiesCanModifySpace(spaceId));
  } else {
    res.status(400);
  }
}

export default requestHandler({
  post: updateSpaceTabOrder,
  get: spacePublicKeys,
});
