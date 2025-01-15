import requestHandler from "@/common/data/api/requestHandler";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextApiRequest, NextApiResponse } from "next/types";

export interface BasescanResponse {
  status: string;
  message: string;
  result: BasescanResult[];
}

export interface BasescanResult {
  contractAddress: string;
  contractCreator: string;
  txHash: string;
  blockNumber: string;
  timestamp: string;
  contractFactory: string;
  creationBytecode: string;
}

async function getContract(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contractAddress } = req.query;
    if (!contractAddress) {
      return res.status(400).json({ error: "Contract address is required" });
    }

    const options: AxiosRequestConfig = {
      method: "GET",
      url: `https://api.basescan.org/api?module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${process.env.BASESCAN_API_KEY}`,
      params: req.query,
    };

    const { data } = await axios.request<BasescanResponse>(options);
    res.status(200).json(data.result[0]);
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
  get: getContract,
});
