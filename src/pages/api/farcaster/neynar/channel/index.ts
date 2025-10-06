import requestHandler from "@/common/data/api/requestHandler";
import { proxyToNeynar } from "@/common/data/api/neynarProxy";
import { NextApiRequest, NextApiResponse } from "next/types";

async function lookupChannel(req: NextApiRequest, res: NextApiResponse) {
  return proxyToNeynar(req, res, "/v2/farcaster/channel");
}

export default requestHandler({
  get: lookupChannel,
});