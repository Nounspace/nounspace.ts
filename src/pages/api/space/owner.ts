import type { NextApiRequest, NextApiResponse } from "next";
import { tokenRequestorFromContractAddress } from "@/common/data/queries/clanker";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { contractAddress } = req.query;
  if (typeof contractAddress !== "string") {
    res.status(400).json({ result: "error", error: { message: "contractAddress required" } });
    return;
  }
  try {
    const data = await tokenRequestorFromContractAddress(contractAddress);
    res.status(200).json({ result: "success", value: data });
  } catch (error) {
    console.error("Token owner lookup failed:", error);
    res.status(500).json({ result: "error", error: { message: (error as Error).message } });
  }
}
