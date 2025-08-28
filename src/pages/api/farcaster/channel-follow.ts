import requestHandler from "@/common/data/api/requestHandler";
import axios, { isAxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

async function followChannel(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json("Missing or invalid Authorization header");
      return;
    }
    const { channelId } = req.body as { channelId: string };
    if (!channelId || typeof channelId !== "string") {
      res.status(400).json("channelId is required");
      return;
    }
    const { data } = await axios.post(
      "https://api.farcaster.xyz/fc/channel-follows",
      { channelId },
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      },
    );
    res.status(200).json(data);
  } catch (e) {
    if (isAxiosError(e)) {
      res
        .status(e.response?.status || 500)
        .json(e.response?.data || "An unknown error occurred");
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

async function unfollowChannel(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json("Missing or invalid Authorization header");
      return;
    }
    const { channelId } = req.body as { channelId: string };
    if (!channelId || typeof channelId !== "string") {
      res.status(400).json("channelId is required");
      return;
    }
    const { data } = await axios.delete(
      "https://api.farcaster.xyz/fc/channel-follows",
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        data: { channelId },
      },
    );
    res.status(200).json(data);
  } catch (e) {
    if (isAxiosError(e)) {
      res
        .status(e.response?.status || 500)
        .json(e.response?.data || "An unknown error occurred");
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
}

export default requestHandler({
  post: followChannel,
  delete: unfollowChannel,
});

