import type { NextApiRequest, NextApiResponse } from "next";
import axios, { isAxiosError } from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fid, channelId } = req.query as { fid?: string; channelId?: string };
    if (!fid || !channelId) { res.status(400).json("fid and channelId are required"); return; }

    const url = `https://api.farcaster.xyz/v1/user-channel?fid=${encodeURIComponent(fid)}&channelId=${encodeURIComponent(channelId)}`;
    const { data } = await axios.get(url);
    res.status(200).json(data);
  } catch (e) {
    if (isAxiosError(e)) {
      console.error("GET /user-channel", e.response?.status, e.response?.data);
      res.status(e.response?.status || 500).json(e.response?.data || "An unknown error occurred");
    } else {
      console.error("GET /user-channel", e);
      res.status(500).json("An unknown error occurred");
    }
  }
}
