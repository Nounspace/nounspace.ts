import requestHandler from "@/common/data/api/requestHandler";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next/types";

export interface NeynarUser {
  object: string;
  fid: number;
  username: string;
  display_name: string;
  custody_address: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
      mentioned_profiles: string[];
    };
    location: {
      latitude: number;
      longitude: number;
      address: {
        city: string;
        state: string;
        state_code: string;
        country: string;
        country_code: string;
      };
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  verified_accounts: {
    platform: string;
    username: string;
  }[];
  power_badge: boolean;
  viewer_context: {
    following: boolean;
    followed_by: boolean;
    blocking: boolean;
    blocked_by: boolean;
  };
}

async function getUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const options: AxiosRequestConfig = {
      method: "GET",
      url: "https://api.neynar.com/v2/farcaster/user/by_username",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY!,
      },
      params: req.query,
    };

    const { data } = await axios.request<NeynarUser>(options);
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
  get: getUser,
});
