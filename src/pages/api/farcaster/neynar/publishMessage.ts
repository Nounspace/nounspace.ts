import neynar from "@/common/data/api/neynar";
import requestHandler from "@/common/data/api/requestHandler";
import { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";


async function publishMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const message = {
      ...req.body.data
    };
    const response = await neynar.publishMessageToFarcaster(message);
    res.status(200).json(response);
  } catch (e: any) {
    if (e.response?.data) {
      console.error("response.data")
      console.dir(e.response.data, { depth: null });
    }
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
