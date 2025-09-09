import { fetchEmpireByAddress } from "@/common/data/queries/empireBuilder";
import type { NextApiRequest, NextApiResponse } from "next";
import { Address } from "viem";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  try {
    const data = await fetchEmpireByAddress(address as Address);
    return res.status(200).json(data);
  } catch (_error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
