import neynar from "@/common/data/api/neynar";
import requestHandler from "@/common/data/api/requestHandler";
// import { MessageData } from "@farcaster/core";
import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";


async function publishMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = { ...req.body };
    const message = { body: data };
    const result = await neynar.publishMessageToFarcaster(message);
    res.status(200).json(result);
    console.log(result)
  } catch (e: any) {
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
