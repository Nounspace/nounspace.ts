import requestHandler from "@/common/data/api/requestHandler";
import { FeedType } from "@neynar/nodejs-sdk";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { isArray, isNil, isString, map, toInteger } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";

async function loadCasts(req: NextApiRequest, res: NextApiResponse) {
  const feedType =
    isNil(req.query.feedType) || isArray(req.query.feedType)
      ? FeedType.Following
      : (req.query.feedType as FeedType);

  const fids = isArray(req.query.fids)
    ? map(req.query.fids, toInteger)
    : isString(req.query.fids)
      ? [toInteger(req.query.fids)]
      : undefined;

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
      fids,
    },
  };

  try {
    const { data } = await axios.request(options);

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
