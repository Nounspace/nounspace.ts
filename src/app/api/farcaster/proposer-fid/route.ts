import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Neynar API key not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
      { 
        method: "GET", 
        headers: { "x-api-key": apiKey },
        // Add caching headers
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!res.ok) {
      throw new Error(`Neynar API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    let proposerFid: number | null = null;
    if (data && data[address] && data[address].length > 0) {
      proposerFid = data[address][0].fid;
    }

    return NextResponse.json({ 
      proposerFid,
      address 
    });

  } catch (error) {
    console.error("[API] Error fetching proposer FID from Neynar:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch proposer FID",
        proposerFid: null 
      },
      { status: 500 }
    );
  }
}
