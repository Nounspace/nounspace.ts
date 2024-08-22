import requestHandler, {
  NounspaceResponse,
} from "@/common/data/api/requestHandler";
import { validateSignable } from "@/common/lib/signedFiles";
import { NextApiRequest, NextApiResponse } from "next/types";
import supabase from "@/common/data/database/supabase/clients/server";
import {
  first,
  includes,
  isArray,
  isNull,
  isObject,
  isUndefined,
  map,
} from "lodash";

export type SpaceOrder = string[];
export type UpdateSpaceOrderResponse = NounspaceResponse<SpaceOrder>;
export type UpdateSpaceOrderRequest = {
  identityPublicKey: string;
  signature: string;
  timestamp: string;
  ordering: SpaceOrder;
  fid: number;
};

function isUpdateSpaceOrderRequest(
  maybe: unknown,
): maybe is UpdateSpaceOrderRequest {
  return (
    isObject(maybe) &&
    typeof maybe["identityPublicKey"] === "string" &&
    typeof maybe["signature"] === "string" &&
    typeof maybe["timestamp"] === "string" &&
    typeof maybe["fid"] === "number" &&
    isArray(maybe["ordering"])
  );
}

async function getSpaceOrder(
  req: NextApiRequest,
  res: NextApiResponse<UpdateSpaceOrderResponse>,
) {
  const fid = req.query.fid;
  if (isUndefined(fid) || isArray(fid)) {
    res.status(400).json({
      result: "error",
      error: {
        message: "fid must be provided as a single query argument",
      },
    });
    return;
  }
  const { data, error } = await supabase
    .from("spaceOrderings")
    .select("ordering")
    .eq("fid", fid);
  if (isNull(data)) {
    res.status(500).json({
      result: "error",
      error: {
        message: error?.message || "an unknown error occurred",
      },
    });
    return;
  }
  res.status(200).json({
    result: "success",
    value: first(data)?.ordering || [],
  });
}

async function updateSpaceOrder(
  req: NextApiRequest,
  res: NextApiResponse<UpdateSpaceOrderResponse>,
) {
  const updateOrderReq: UpdateSpaceOrderRequest = req.body;
  if (!isUpdateSpaceOrderRequest(updateOrderReq)) {
    res.status(400).json({
      result: "error",
      error: {
        message:
          "Config must contain identityPublicKey, fileData, fileType, isEncrypted, and timestamp",
      },
    });
    return;
  }
  if (!validateSignable(updateOrderReq, "identityPublicKey")) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Invalid signature",
      },
    });
    return;
  }
  const { data: fidsForPublicKey, error: fidLookupError } = await supabase
    .from("fidRegistrations")
    .select("fid")
    .eq("identityPublicKey", updateOrderReq.identityPublicKey);
  if (fidLookupError) {
    res.status(500).json({
      result: "error",
      error: {
        message: fidLookupError.message,
      },
    });
    return;
  }
  if (isNull(fidsForPublicKey)) {
    res.status(500).json({
      result: "error",
      error: {
        message: "Query returned no data",
      },
    });
    return;
  }
  if (
    !includes(
      map(fidsForPublicKey, (d) => d.fid),
      updateOrderReq.fid,
    )
  ) {
    res.status(400).json({
      result: "error",
      error: {
        message: "Space ID cannot edit that FID",
      },
    });
    return;
  }
  // TO DO: check that all of the items in the order array are valid
  const { error } = await supabase
    .from("spaceOrderings")
    .upsert(updateOrderReq, { onConflict: "fid" })
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
    value: updateOrderReq.ordering,
  });
}

export default requestHandler({
  post: updateSpaceOrder,
  get: getSpaceOrder,
});
