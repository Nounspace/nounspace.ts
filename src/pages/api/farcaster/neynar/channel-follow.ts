import requestHandler from "@/common/data/api/requestHandler";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next/types";

async function followChannel(req: NextApiRequest, res: NextApiResponse) {
  try {
    const options: AxiosRequestConfig = {
      method: "POST",
      url: "https://api.neynar.com/v2/farcaster/channel/follow/",
      headers: {
        accept: "application/json",
        "x-api-key": process.env.NEYNAR_API_KEY!,
        "Content-Type": "application/json",
      },
      data: req.body,
    };
    const { data } = await axios.request(options);
    res.status(200).json(data);
  } catch (e) {
    if (isAxiosError(e)) {
      res.status(e.response?.status || 500).json(e.response?.data || "An unknown error occurred");
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

async function unfollowChannel(req: NextApiRequest, res: NextApiResponse) {
  try {
    const options: AxiosRequestConfig = {
      method: "DELETE",
      url: "https://api.neynar.com/v2/farcaster/channel/follow/",
      headers: {
        accept: "application/json",
        "x-api-key": process.env.NEYNAR_API_KEY!,
        "Content-Type": "application/json",
      },
      data: req.body,
    };
    const { data } = await axios.request(options);
    res.status(200).json(data);
  } catch (e) {
    if (isAxiosError(e)) {
      res.status(e.response?.status || 500).json(e.response?.data || "An unknown error occurred");
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

export default requestHandler({
  post: followChannel,
  delete: unfollowChannel,
});
