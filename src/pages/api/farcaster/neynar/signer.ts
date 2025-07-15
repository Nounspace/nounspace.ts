import requestHandler from "@/common/data/api/requestHandler";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

async function getSignerUUID(req: NextApiRequest, res: NextApiResponse) {
  const { fid } = req.query;
  if (!fid || Array.isArray(fid)) {
    return res.status(400).json({ error: "Missing fid" });
  }

  const options: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.neynar.com/v2/farcaster/signer/list",
    headers: {
      accept: "application/json",
      api_key: process.env.NEYNAR_API_KEY!,
    },
    params: { fid },
  };

  try {
    const { data } = await axios.request(options);
    const uuid = data?.signers?.[0]?.uuid as string | undefined;
    if (!uuid) {
      return res.status(404).json({ error: "Signer not found" });
    }
    res.status(200).json({ signer_uuid: uuid });
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
  get: getSignerUUID,
});
