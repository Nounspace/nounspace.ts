import { NextRequest, NextResponse } from "next/server";
import { getFrame } from "frames.js/getFrame";

// TODO: FIX BUTTON LABELS

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
      console.log("Button found:", { index, label });
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
  // console.log button labels
  buttons.forEach((button) => {
    const buttonLabel = button.label || "Open";
    console.log("Button label:", buttonLabel);
  });
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
  const specification = request.nextUrl.searchParams.get("specification") ?? "farcaster_v2";
  const fid = request.nextUrl.searchParams.get("fid");

  if (!url) {
    return NextResponse.json({ message: "Missing URL parameter" }, { status: 400 });
  }
  if (typeof url !== "string" || !url.startsWith("http")) {
    return NextResponse.json({ message: "Invalid URL. Must start with http(s)://" }, { status: 400 });
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
      specification: "farcaster",
    });

    let frameData: FrameData;
    if (frameResult.status === "success" && frameResult.frame) {
      const frame = frameResult.frame;
      frameData = {
        image: frame.image || null,
        title: frame.title || null,
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
        console.log(`Using FID ${fidNumber} for frame authentication`);
      }
    }

    console.log("Frame parsed successfully:", frameData);
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

    if (!frameUrl) {
      return NextResponse.json({ message: "Missing frameUrl in request body" }, { status: 400 });
    }
    if (typeof frameUrl !== "string" || !frameUrl.startsWith("http")) {
      return NextResponse.json({ message: "Invalid URL. Must start with http(s)://" }, { status: 400 });
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
      specification: "farcaster",
    });

    let frameData: FrameData;
    if (frameResult.status === "success" && frameResult.frame) {
      const frame = frameResult.frame;
      frameData = {
        image: frame.image || null,
        title: frame.title || null,
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