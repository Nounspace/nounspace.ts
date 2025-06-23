import requestHandler from "@/common/data/api/requestHandler";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next/types";

async function loadChannel(req: NextApiRequest, res: NextApiResponse) {
  try {
    const options: AxiosRequestConfig = {
      method: "GET",
      url: "https://api.neynar.com/v2/farcaster/channel",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY!,
      },
      params: req.query,
    };

    const { data } = await axios.request(options);

    if (data.status && data.status !== 200) {
      return res.status(data.status).json(data);
    }

    try {
      const fcRes = await axios.get("https://api.farcaster.xyz/v2/all-channels");
      const fcChannel = fcRes.data.result.channels.find(
        (c: any) => c.id === req.query.id,
      );

      if (fcChannel) {
        data.channel.followers = fcChannel.followerCount;
        data.channel.external_link = fcChannel.externalLink;
      }
    } catch {
      // ignore errors from farcaster client API
    }

    res.status(200).json(data);
  } catch (e) {
    if (isAxiosError(e)) {
      res
        .status(e.response!.data.status || 500)
        .json(e.response!.data || "An unknown error occurred");
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

export default requestHandler({
  get: loadChannel,
});
