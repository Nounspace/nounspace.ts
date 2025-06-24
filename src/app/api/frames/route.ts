import { NextRequest, NextResponse } from "next/server";
import { getFrame } from "frames.js";

// TODO: FIX BUTTON LABELS

// Helper to normalize specification to supported values
function normalizeSpecification(spec: string | null): "farcaster" | "openframes" {
  return spec === "openframes" ? "openframes" : "farcaster";
}

// SSRF protection: Block internal IP ranges and localhost
function isInternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Block localhost variations
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return true;
    }
    
    // Block private IP ranges
    const ip = hostname.split('.');
    if (ip.length === 4 && ip.every(octet => /^\d+$/.test(octet))) {
      const [a, b, c, d] = ip.map(Number);
      
      // 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
      if (a === 10) return true;
      
      // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
      if (a === 172 && b >= 16 && b <= 31) return true;
      
      // 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
      if (a === 192 && b === 168) return true;
      
      // 169.254.0.0/16 (Link-local addresses)
      if (a === 169 && b === 254) return true;
      
      // 0.0.0.0/8 (Current network)
      if (a === 0) return true;
    }
    
    // Block other localhost variations
    if (hostname.endsWith('.localhost') || hostname.includes('local')) {
      return true;
    }
    
    return false;
  } catch {
    return true; // If URL parsing fails, consider it unsafe
  }
}

// --- Type Definitions ---
interface FrameData {
  image: string | null;
  title: string | null;
  buttons: { label: string; action: string }[];
  inputText: boolean;
  postUrl: string | null;
}

// Removed FrameObject interface since we're using frames.js types directly

// Helper: Regex-based fallback parser for frame metadata
async function parseFrameFallback(url: string): Promise<FrameData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FrameViewer/1.0)",
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch URL: ${response.statusText}`);
  const html = await response.text();

  const imageMatch =
    html.match(/<meta\s+property="fc:frame:image"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i) ||
    html.match(/<meta\s+property="og:image"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i);
  const titleMatch =
    html.match(/<meta\s+property="fc:frame:title"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i) ||
    html.match(/<meta\s+property="og:title"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i) ||
    html.match(/<title>([^<]+)<\/title>/i);
  const buttonsMatch = Array.from(
    html.matchAll(/<meta\s+property="fc:frame:button:(\d+)"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/gi)
  );
  const inputTextMatch = html.match(
    /<meta\s+property="fc:frame:input:text"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i
  );
  const postUrlMatch = html.match(
    /<meta\s+property="fc:frame:post_url"(?:\s+content="([^"]+)"|\s+name="([^"]+)")/i
  );

  const buttons = buttonsMatch
    .map((match) => {
      const index = parseInt(match[1]);
      const label = match[2] || match[3] || "Button";
      return { index, label, action: "post" };
    })
    .sort((a, b) => a.index - b.index);

  let imageUrl: string | null = null;
  if (imageMatch) {
    imageUrl = imageMatch[1] || imageMatch[2] || null;
    if (
      imageUrl &&
      typeof imageUrl === "string" &&
      !imageUrl.startsWith("http") &&
      !imageUrl.startsWith("data:")
    ) {
      const urlObj = new URL(url);
      if (imageUrl.startsWith("/")) {
        imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
      } else {
        const path = urlObj.pathname.split("/").slice(0, -1).join("/");
        imageUrl = `${urlObj.protocol}//${urlObj.host}${path}/${imageUrl}`;
      }
    }
  }
  const title: string | null = titleMatch ? titleMatch[1] || titleMatch[2] || null : null;
  const postUrl: string | null = postUrlMatch ? postUrlMatch[1] || postUrlMatch[2] || url : url;
  
  return {
    image: imageUrl,
    title,
    buttons: buttons.length > 0 ? buttons.map((b) => ({ label: b.label, action: b.action })) : [{ label: "Open", action: "post" }],
    inputText: !!inputTextMatch,
    postUrl,
  };
}

// Removed extractFrameData function since we're using parseFrameFallback directly

// GET handler
export async function GET(request: NextRequest): Promise<Response> {
  const url = request.nextUrl.searchParams.get("url");
  const specification = normalizeSpecification(request.nextUrl.searchParams.get("specification"));
  const fid = request.nextUrl.searchParams.get("fid");

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
    let html: string;
    {
      const urlRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FrameViewer/1.0)" },
      });
      html = await urlRes.text();
    }
    // Use the new getFrame function from frames.js
    const frameResult = await getFrame({
      htmlString: html,
      url: url,
      specification: specification,
    });

    let frameData: FrameData;
    if (frameResult.status === "success" && frameResult.frame) {
      const frame = frameResult.frame;
      frameData = {
        image: frame.image || null,
        title: null,
        buttons: frame.buttons ? frame.buttons.map(btn => ({
          label: btn.label || "Open",
          action: btn.action || "post"
        })) : [],
        inputText: !!frame.inputText,
        postUrl: frame.postUrl || url,
      };
    } else {
      // Fall back to manual parsing if getFrame fails
      frameData = await parseFrameFallback(url);
    }

    if (!frameData.buttons || frameData.buttons.length === 0) {
      frameData.buttons = [{ label: "Open", action: "post" }];
    }

    if (fid) {
      const fidNumber = parseInt(fid as string);
      if (!isNaN(fidNumber)) {
        // FID provided for frame authentication
      }
    }

    return NextResponse.json(frameData);
  } catch (err) {
    console.error("Error fetching frame:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { frameUrl, buttonIndex } = body;
    const specification = normalizeSpecification(request.nextUrl.searchParams.get("specification"));

    if (!frameUrl) {
      return NextResponse.json({ message: "Missing frameUrl in request body" }, { status: 400 });
    }
    if (typeof frameUrl !== "string" || !frameUrl.startsWith("http")) {
      return NextResponse.json({ message: "Invalid URL. Must start with http(s)://" }, { status: 400 });
    }
    if (isInternalUrl(frameUrl)) {
      return NextResponse.json({ message: "Invalid URL. Internal URLs are not allowed." }, { status: 400 });
    }

    let html: string;
    {
      const urlRes = await fetch(frameUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FrameViewer/1.0)" },
      });
      html = await urlRes.text();
    }
    // Use the new getFrame function from frames.js
    const frameResult = await getFrame({
      htmlString: html,
      url: frameUrl,
      specification: specification,
    });

    let frameData: FrameData;
    if (frameResult.status === "success" && frameResult.frame) {
      const frame = frameResult.frame;
      frameData = {
        image: frame.image || null,
        title: null,
        buttons: frame.buttons ? frame.buttons.map(btn => ({
          label: btn.label || "Open",
          action: btn.action || "post"
        })) : [],
        inputText: !!frame.inputText,
        postUrl: frame.postUrl || frameUrl,
      };
    } else {
      // Fall back to manual parsing if getFrame fails
      frameData = await parseFrameFallback(frameUrl);
    }

    if (!frameData.buttons || frameData.buttons.length === 0) {
      frameData.buttons = [{ label: "Open", action: "post" }];
    }

    return NextResponse.json(frameData);
  } catch (error) {
    console.error("Error processing frame action:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}