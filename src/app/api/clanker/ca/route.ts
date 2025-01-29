import { fetchClankerByAddress } from "@/common/data/queries/clanker";
import { NextRequest, NextResponse } from "next/server";
import { Address } from "viem";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams;
  const address = query.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const data = await fetchClankerByAddress(address as Address);
    return NextResponse.json(data);
  } catch (error) {
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
