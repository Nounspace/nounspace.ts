import { HubRestAPIClient } from "@standard-crypto/farcaster-js-hub-rest";
import axios, { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    api_key: process.env.NEYNAR_API_KEY,
  },
});
const writeClient = new HubRestAPIClient({
  hubUrl: process.env.NEXT_PUBLIC_HUB_HTTP_URL,
  axiosInstance,
});

export async function GET(req: NextRequest) {
  try {
    const result = await writeClient.apis.submitMessage.submitMessage({
      body: req.body,
    });
    return NextResponse.json(result.data, { status: result.status });
  } catch (e: any) {
    return NextResponse.json(e?.response?.data || "Unknown error occurred", { status: e?.status || 500 });
  }
}
