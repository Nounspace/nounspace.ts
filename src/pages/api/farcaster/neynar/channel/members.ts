import requestHandler from "@/common/data/api/requestHandler";
import { proxyToNeynar } from "@/common/data/api/neynarProxy";
import { NextApiRequest, NextApiResponse } from "next/types";

const getSingleQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

async function fetchChannelMembers(req: NextApiRequest, res: NextApiResponse) {
  const channelId = getSingleQueryValue(req.query.id);

  if (!channelId) {
    return res.status(400).json({
      result: "error",
      error: { message: "Missing required channel id" },
    });
  }

  const { id: _unusedId, ...rest } = req.query;
  
  // Modify the query parameters
  req.query = {
    ...rest,
    channel_id: channelId,
  };
  
  return proxyToNeynar(req, res, "/v2/farcaster/channel/member/list");
}

export default requestHandler({
  get: fetchChannelMembers,
});