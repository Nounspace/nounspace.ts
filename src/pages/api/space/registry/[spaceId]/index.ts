import supabase from "@/common/data/database/supabase/clients/server";
import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import {
  isSignable,
  Signable,
  validateSignable,
} from "@/common/lib/signedFiles";
import { isArray, isString, isNull, first } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";
import { identityCanModifySpace } from "./tabs/[tabId]";
import stringify from "fast-json-stable-stringify";
import {
  loadIdentitiesOwningContractSpace,
  loadOwnedItentitiesForSpaceByFid,
} from "@/common/data/database/supabase/serverHelpers";

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

  console.log(
    "[registry space] Updating tab order",
    stringify(updateOrderRequest),
  );

  const { data, error } = await supabase.storage
    .from("spaces")
    .upload(
      `${updateOrderRequest.spaceId}/tabOrder`,
      new Blob([stringify(updateOrderRequest)], { type: "application/json" }),
      { upsert: true },
    );

  console.log("[registry space] Supabase Data", data);
  console.log("[registry space] Supabase Error", error);

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
  console.log("Checking identities that can modify space", stringify(spaceId));
  const { data: spaceRegistrationData } = await supabase
    .from("spaceRegistrations")
    .select("contractAddress")
    .eq("spaceId", spaceId);
  if (spaceRegistrationData === null || spaceRegistrationData.length === 0)
    return [];
  const contractAddress = first(spaceRegistrationData)!.contractAddress;
  if (!isNull(contractAddress)) {
    return await loadIdentitiesOwningContractSpace(contractAddress);
  } else {
    return await loadOwnedItentitiesForSpaceByFid(spaceId);
  }
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
