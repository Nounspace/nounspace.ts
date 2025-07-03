import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "@/common/data/database/supabase/clients/server";
import { NounspaceResponse } from "@/common/data/api/requestHandler";
import { first } from "lodash";

export default async function fromContract(
  req: NextApiRequest,
  res: NextApiResponse<NounspaceResponse>,
) {
  const { contractAddress: contractAddressQuery, network: networkQuery } = req.query;

  const contractAddress = Array.isArray(contractAddressQuery)
    ? contractAddressQuery[0]
    : contractAddressQuery;
  const network = Array.isArray(networkQuery) ? networkQuery[0] : networkQuery;

  if (!contractAddress || !network) {
    return res
      .status(400)
      .json({ result: "error", error: { message: "Missing params" } });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spaceRegistrations")
    .select("spaceId")
    .eq("contractAddress", contractAddress)
    .eq("network", network);

  if (error) {
    return res
      .status(500)
      .json({ result: "error", error: { message: error.message } });
  }

  const space = first(data);

  if (space) {
    res.status(200).json({ result: "success", value: space });
  } else {
    res.status(404).json({ result: "error", error: { message: "Not found" } });
  }
}
