import requestHandler from "@/common/data/api/requestHandler";
import { HubRestAPIClient } from "@standard-crypto/farcaster-js-hub-rest";
import axios, { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    api_key: process.env.NEYNAR_API_KEY,
  },
});
const writeClient = new HubRestAPIClient({
  hubUrl: process.env.NEXT_PUBLIC_HUB_HTTP_URL,
  axiosInstance,
});

async function submitMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await writeClient.apis.validateMessage.validateMessage({
      body: req.body,
    });
    res.status(result.status).json(result.data);
  } catch (e) {
    if (isAxiosError(e)) {
      res.status(e.status || 500).json(e.response?.data);
    } else {
      res.status(500).json("Unknown error occurred");
    }
  }
}

export default requestHandler({
  post: submitMessage,
});
