import requestHandler from "@/common/data/api/requestHandler";
import { proxyToNeynar } from "@/common/data/api/neynarProxy";
import { NextApiRequest, NextApiResponse } from "next/types";

async function fetchChannelFollowers(req: NextApiRequest, res: NextApiResponse) {
  return proxyToNeynar(req, res, "/v2/farcaster/channel/followers");
}

export default requestHandler({
  get: fetchChannelFollowers,
});