import { NextRequest, NextResponse } from "next/server";
import { isIP } from "node:net";

export const revalidate = 3600; // Cache responses for 1 hour

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

const IPV4_RANGES: Array<[number, number]> = [
  ["0.0.0.0", "0.255.255.255"],
  ["10.0.0.0", "10.255.255.255"],
  ["100.64.0.0", "100.127.255.255"],
  ["127.0.0.0", "127.255.255.255"],
  ["169.254.0.0", "169.254.255.255"],
  ["172.16.0.0", "172.31.255.255"],
  ["192.168.0.0", "192.168.255.255"],
  ["224.0.0.0", "255.255.255.255"],
].map(([start, end]) => [ipToLong(start), ipToLong(end)]);

function inIpv4Ranges(ip: string): boolean {
  const num = ipToLong(ip);
  return IPV4_RANGES.some(([s, e]) => num >= s && num <= e);
}

function isReservedIpv6(addr: string): boolean {
  const lower = addr.toLowerCase();
  return (
    lower === "::" ||
    lower === "::1" ||
    /^f[cd]/.test(lower) ||      // ULA (Unique Local Addresses)
    /^fe[89ab]/.test(lower) ||   // Link-local
    /^2001:db8/.test(lower) ||   // Documentation
    /^2001:10/.test(lower) ||    // ORCHID
    lower.startsWith("ff")
  );
}

function isInternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return true;
    }

    const ipType = isIP(hostname);
    if (ipType === 4 && inIpv4Ranges(hostname)) {
      return true;
    }
    if (ipType === 6 && isReservedIpv6(hostname)) {
      return true;
    }

    if (hostname.endsWith(".localhost") || hostname.includes("local")) {
      return true;
    }

    return false;
  } catch {
    return true; // If URL parsing fails, consider it unsafe
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ message: "Missing URL parameter" }, { status: 400 });
  }
  if (typeof url !== "string" || !url.startsWith("http")) {
    return NextResponse.json({ message: "Invalid URL. Must start with http(s)://" }, { status: 400 });
  }
  if (isInternalUrl(url)) {
    return NextResponse.json({ message: "Invalid URL. Internal URLs are not allowed." }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 NounspaceBot/1.0" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ message: `Failed to fetch URL: ${res.status}` }, { status: 500 });
    }

    const html = await res.text();
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error fetching iframe content:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
