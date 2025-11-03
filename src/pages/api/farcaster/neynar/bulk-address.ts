import type { NextApiRequest, NextApiResponse } from "next";
import requestHandler from "@/common/data/api/requestHandler";
import neynar from "@/common/data/api/neynar";

const getAddresses = (query: NextApiRequest["query"]) => {
  const raw = query.addresses ?? query["addresses[]"];
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") return raw.split(",").map((s) => s.trim());
  return [] as string[];
};

async function bulkByAddress(req: NextApiRequest, res: NextApiResponse) {
  try {
    const addresses = getAddresses(req.query).filter(Boolean);
    if (!addresses.length) {
      return res.status(400).json({
        result: "error",
        error: { message: "Missing addresses[] query params" },
      });
    }

    const data = await neynar.fetchBulkUsersByEthOrSolAddress({ addresses });
    return res.status(200).json(data);
  } catch (e: any) {
    console.error("bulk-address error", e);
    return res.status(500).json({
      result: "error",
      error: { message: e?.message || "Failed to fetch users by address" },
    });
  }
}

export default requestHandler({ get: bulkByAddress });

