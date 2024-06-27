import neynar from "@/common/data/api/neynar";
import requestHandler from "@/common/data/api/requestHandler";
import { FeedType } from "@neynar/nodejs-sdk";
import { isAxiosError } from "axios";
import { isArray, isNil } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";

async function loadCasts(req: NextApiRequest, res: NextApiResponse) {
  const feedType =
    isNil(req.query.feedType) || isArray(req.query.feedType)
      ? FeedType.Following
      : (req.query.feedType as FeedType);

  try {
    const data = await neynar.fetchFeed(feedType, req.query);

    res.status(200).json(data);
  } catch (e) {
    console.log(e);
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
