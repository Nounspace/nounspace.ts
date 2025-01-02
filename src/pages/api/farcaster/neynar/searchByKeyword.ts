import requestHandler from "@/common/data/api/requestHandler";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { isNil } from "lodash";
import { NextApiRequest, NextApiResponse } from "next/types";

async function searchCasts(req: NextApiRequest, res: NextApiResponse) {
  const keyword = isNil(req.query.keyword) ? "" : req.query.keyword;

  const options: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.neynar.com/v2/farcaster/cast/search",
    headers: {
      accept: "application/json",
      api_key: process.env.NEYNAR_API_KEY!,
    },
    params: {
      q: keyword,
      priority_mode: false,
      limit: 25,
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
  get: searchCasts,
});
