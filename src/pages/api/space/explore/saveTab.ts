import requestHandler from "@/common/data/api/requestHandler";
import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { SPACE_TYPES } from "@/common/types/spaceData";
import stringify from "fast-json-stable-stringify";
import { isNil, isString } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";

interface ExploreSaveTabBody {
  spaceId?: string;
  tabName?: string;
  config?: unknown;
}

async function saveExploreTab(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body as ExploreSaveTabBody;
  const { spaceId, tabName, config } = body || {};

  if (!isString(spaceId) || !isString(tabName) || isNil(config)) {
    res.status(400).json({
      result: "error",
      error: { message: "spaceId, tabName, and config are required" },
    });
    return;
  }

  const supabase = createSupabaseServerClient();

  // Verify explore registration exists
  const { data: reg, error: regError } = await supabase
    .from("spaceRegistrations")
    .select("spaceId")
    .eq("spaceId", spaceId)
    .eq("spaceType", SPACE_TYPES.EXPLORE)
    .limit(1)
    .maybeSingle();

  if (regError || !reg) {
    res.status(400).json({
      result: "error",
      error: { message: "Explore space not found or not registered" },
    });
    return;
  }

  const filePayload = {
    fileData: stringify(config),
    fileType: "json",
    publicKey: "explore-service",
    isEncrypted: false,
    timestamp: new Date().toISOString(),
    signature: "explore-service",
    fileName: tabName,
  };

  const { error: uploadError } = await supabase.storage
    .from("spaces")
    .upload(
      `${spaceId}/tabs/${tabName}`,
      new Blob([stringify(filePayload)], { type: "application/json" }),
      { upsert: true },
    );

  if (uploadError) {
    res.status(500).json({
      result: "error",
      error: { message: uploadError.message },
    });
    return;
  }

  res.status(200).json({ result: "success", value: true });
}

export default requestHandler({
  post: saveExploreTab,
});
