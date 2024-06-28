import neynar from "@/common/data/api/neynar";
import requestHandler from "@/common/data/api/requestHandler";
import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

async function publishMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await neynar.publishMessageToFarcaster(req.body);
    res.status(200).json(result);
  } catch (e) {
    if (isAxiosError(e)) {
      res.status(e.status || 500).json(e.response?.data);
    } else {
      res.status(500).json("Unknown error occurred");
    }
  }
}

export default requestHandler({
  post: publishMessage,
});
