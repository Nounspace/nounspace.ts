import requestHandler from "@/common/data/api/requestHandler";
import { FeedType } from "@neynar/nodejs-sdk/build/api";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { isArray, isNil } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";

async function loadCasts(req: NextApiRequest, res: NextApiResponse) {
  const feedType =
    isNil(req.query.feedType) || isArray(req.query.feedType)
      ? FeedType.Following
      : (req.query.feedType as string);

  let url = "https://api.neynar.com/v2/farcaster/feed";
  const params = { ...req.query };
  let options: AxiosRequestConfig;
  if (feedType === "for_you") {
    url = "https://api.neynar.com/v2/farcaster/feed/for_you";
    const { fid, cursor, limit } = params;
    if (!fid || fid === "-1") {
      return res.status(400).json({ error: "Invalid or missing FID for 'For you' feed. Please log in to access this feature." });
    }
    options = {
      method: "GET",
      url,
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY!,
      },
      params: { fid, cursor, limit },
    };
  } else if (feedType === "trending") {
    url = "https://api.neynar.com/v2/farcaster/feed/trending";
    const { cursor, limit } = params;
    options = {
      method: "GET",
      url,
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY!,
      },
      params: { cursor, limit },
    };
  } else {
    options = {
      method: "GET",
      url,
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY!,
      },
      params: { ...params, feed_type: feedType },
    };
  }

  try {
    const { data } = await axios.request(options);
    res.status(200).json(data);
  } catch (e) {
    if (isAxiosError(e)) {
      res
        .status(e.response?.data?.status || 500)
        .json(e.response?.data || { error: e.message });
    } else {
      res.status(500).json({ error: (e as Error).message });
    }
  }
}

export default requestHandler({
  get: loadCasts,
});