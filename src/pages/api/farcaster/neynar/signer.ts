import requestHandler from "@/common/data/api/requestHandler";
import axios, { isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

async function getSigner(req: NextApiRequest, res: NextApiResponse) {
  const fid = req.query.fid;
  if (!fid || Array.isArray(fid)) {
    return res.status(400).json({ error: "Missing fid" });
  }
  try {
    const { data } = await axios.get<
      { result?: { signers: { signer_uuid: string }[] } }
    >("https://api.neynar.com/v2/farcaster/user/signers", {
      headers: { "x-api-key": process.env.NEYNAR_API_KEY! },
      params: { fid },
    });

    const signer = data.result?.signers?.[0];
    if (!signer) {
      return res.status(404).json({ error: "Signer not found" });
    }

    res.status(200).json({ signer_uuid: signer.signer_uuid });
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

export default requestHandler({ get: getSigner });
