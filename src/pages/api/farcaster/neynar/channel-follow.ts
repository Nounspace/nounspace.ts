import requestHandler from "@/common/data/api/requestHandler";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next/types";
import neynar from "@/common/data/api/neynar";

async function resolveSignerUuid(body: any): Promise<string> {
  if (body.signer_uuid) return body.signer_uuid;
  if (body.signer_public_key) {
    const signer = (await neynar.lookupDeveloperManagedSigner({
      publicKey: body.signer_public_key,
    })) as any;
    return signer.signer_uuid;
  }
  throw new Error("signer_uuid or signer_public_key is required");
}

async function followChannel(req: NextApiRequest, res: NextApiResponse) {
  try {
    const signerUuid = await resolveSignerUuid(req.body);
    const options: AxiosRequestConfig = {
      method: "POST",
      url: "https://api.neynar.com/v2/farcaster/channel/follow/",
      headers: {
        accept: "application/json",
        "x-api-key": process.env.NEYNAR_API_KEY!,
        "Content-Type": "application/json",
      },
      data: { signer_uuid: signerUuid, channel_id: req.body.channel_id },
    };
    const { data } = await axios.request(options);
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
    const signerUuid = await resolveSignerUuid(req.body);
    const options: AxiosRequestConfig = {
      method: "DELETE",
      url: "https://api.neynar.com/v2/farcaster/channel/follow/",
      headers: {
        accept: "application/json",
        "x-api-key": process.env.NEYNAR_API_KEY!,
        "Content-Type": "application/json",
      },
      data: { signer_uuid: signerUuid, channel_id: req.body.channel_id },
    };
    const { data } = await axios.request(options);
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
