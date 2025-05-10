import requestHandler from "@/common/data/api/requestHandler";
import { FeedType } from "@neynar/nodejs-sdk/build/api";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { isArray, isNil } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";

async function loadCasts(req: NextApiRequest, res: NextApiResponse) {
  const feedType =
    isNil(req.query.feedType) || isArray(req.query.feedType)
      ? FeedType.Following
      : (req.query.feedType as FeedType);

  const options: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.neynar.com/v2/farcaster/feed",
    headers: {
      accept: "application/json",
      api_key: process.env.NEYNAR_API_KEY!,
    },
    params: {
      ...req.query,
      feed_type: feedType,
    },
  };

  try {
    const { data } = await axios.request(options);
    if (data.status && data.status !== 200) {
      return res.status(data.status).json(data);
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
  get: loadCasts,
});
