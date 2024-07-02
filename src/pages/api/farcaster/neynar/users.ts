import requestHandler from "@/common/data/api/requestHandler";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next/types";

async function loadUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const options: AxiosRequestConfig = {
      method: "GET",
      url: "https://api.neynar.com/v2/farcaster/user/bulk",
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
  get: loadUsers,
});
