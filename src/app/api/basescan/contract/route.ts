import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

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


export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams;
    const contractAddress = query.get("contractAddress");
    if (!contractAddress) {
      return NextResponse.json({ error: "Contract address is required" }, { status: 400 });
    }

    const options: AxiosRequestConfig = {
      method: "GET",
      url: `https://api.basescan.org/api?module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${process.env.BASESCAN_API_KEY}`,
      params: query,
    };

    const { data } = await axios.request<BasescanResponse>(options);
    return NextResponse.json(data.result[0]);
  } catch (e) {
    if (isAxiosError(e)) {
      return NextResponse.json(e.response!.data || "An unknown error occurred", { status: e.response!.data.status || 500 });
    }
    return NextResponse.json("An unknown error occurred", { status: 500 });
  }
}
