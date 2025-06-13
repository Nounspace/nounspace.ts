import { NextRequest, NextResponse } from "next/server";
import RSSParser from "rss-parser";

// SSRF protection: Block internal IP ranges and localhost
function isInternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Block localhost variations
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return true;
    }

    // Block private IP ranges
    const ip = hostname.split(".");
    if (ip.length === 4 && ip.every((octet) => /^\d+$/.test(octet))) {
      const [a, b] = ip.map(Number);

      // 10.0.0.0/8
      if (a === 10) return true;
      // 172.16.0.0/12
      if (a === 172 && b >= 16 && b <= 31) return true;
      // 192.168.0.0/16
      if (a === 192 && b === 168) return true;
      // 169.254.0.0/16
      if (a === 169 && b === 254) return true;
      // 0.0.0.0/8
      if (a === 0) return true;
    }

    // Block other localhost variations
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
    return NextResponse.json(
      { message: "Invalid URL. Must start with http(s)://" },
      { status: 400 },
    );
  }
  if (isInternalUrl(url)) {
    return NextResponse.json(
      { message: "Invalid URL. Internal URLs are not allowed." },
      { status: 400 },
    );
  }

  try {
    const parser = new RSSParser();
    const feed = await parser.parseURL(url);

    return NextResponse.json({
      title: feed.title || null,
      description: feed.description || null,
      link: feed.link || null,
      image: feed.image || null,
      items: feed.items || [],
    });
  } catch (err) {
    console.error("Error fetching RSS feed:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
