import requestHandler from "@/common/data/api/requestHandler";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next/types";

const getSingleQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

async function fetchChannelMembers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const channelId = getSingleQueryValue(req.query.id);

    if (!channelId) {
      return res.status(400).json({
        result: "error",
        error: { message: "Missing required channel id" },
      });
    }

    const { id: _unusedId, ...rest } = req.query;

    const options: AxiosRequestConfig = {
      method: "GET",
      url: "https://api.neynar.com/v2/farcaster/channel/member/list",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY!,
      },
      params: {
        ...rest,
        channel_id: channelId,
      },
    };

    const { data } = await axios.request(options);

    if (data.status && data.status !== 200) {
      return res.status(data.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status || error.response?.data?.status || 500;
      return res.status(status).json(error.response?.data || "An unknown error occurred");
    }
    res.status(500).json("An unknown error occurred");
  }
}

export default requestHandler({
  get: fetchChannelMembers,
});
