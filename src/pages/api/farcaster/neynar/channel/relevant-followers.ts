import requestHandler from "@/common/data/api/requestHandler";
import { proxyToNeynar } from "@/common/data/api/neynarProxy";
import { NextApiRequest, NextApiResponse } from "next/types";

const getSingleQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

async function fetchChannelRelevantFollowers(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const channelId = getSingleQueryValue(req.query.id);
  const viewerFidParam = getSingleQueryValue(req.query.viewer_fid);

  if (!channelId || !viewerFidParam) {
    return res.status(400).json({
      result: "error",
      error: { message: "Missing required channel id or viewer fid" },
    });
  }

  const { id: _unusedId, viewer_fid: _unusedViewerFid, ...rest } = req.query;
  
  // Modify the query parameters
  req.query = {
    ...rest,
    id: channelId,
    viewer_fid: viewerFidParam,
  };
  
  return proxyToNeynar(req, res, "/v2/farcaster/channel/relevant-followers");
}

export default requestHandler({
  get: fetchChannelRelevantFollowers,
});