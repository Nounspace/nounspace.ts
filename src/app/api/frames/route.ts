import { NextRequest, NextResponse } from "next/server";
import { parseFramesWithReports } from "frames.js/parseFramesWithReports";

// TODO: FIX BUTTON LABELS

// --- Type Definitions ---
interface FrameData {
  image: string | null;
  title: string | null;
  buttons: { label: string; action: string }[];
  inputText: boolean;
  postUrl: string | null;
}

interface FrameObject {
  image?: string | null;
  title?: string | null;
  buttons?: { label?: string; action?: string }[];
  input?: { text?: string };
  inputText?: boolean;
  postUrl?: string | null;
}

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

// Extract frame data from parseFramesWithReports result
function extractFrameData(parseResult: unknown, fallbackUrl: string): FrameData {
  type RawMeta = { flattenedMeta?: Record<string, string> };
  type FarcasterV2 = { status: string; frame: FrameObject };
  type Farcaster = { status: string; frame: FrameObject };
  type ParseResult = {
    raw?: RawMeta;
    farcaster_v2?: FarcasterV2;
    farcaster?: Farcaster;
  };
  const safeParseResult = parseResult as ParseResult;

  const frameData: FrameData = {
    image: null,
    title: null,
    buttons: [],
    inputText: false,
    postUrl: fallbackUrl,
  };

  try {
    if (safeParseResult.raw?.flattenedMeta) {
      const meta = safeParseResult.raw.flattenedMeta;

      // --- PATCH: Handle JSON "next" format in fc:frame meta tag ---
      if (meta["fc:frame"]) {
        // Try to parse as JSON only if it looks like JSON
        const fcFrameRaw = meta["fc:frame"].trim();
        if (fcFrameRaw.startsWith("{") || fcFrameRaw.startsWith("[")) {
          try {
            const fcFrame = JSON.parse(fcFrameRaw);
            if (fcFrame && typeof fcFrame === "object") {
              frameData.image = fcFrame.imageUrl || null;
              frameData.title = fcFrame.title || null;
              frameData.postUrl = fcFrame.postUrl || fallbackUrl;
              if (fcFrame.button) {
                const buttons = Array.isArray(fcFrame.button)
                  ? fcFrame.button
                  : [fcFrame.button];
                frameData.buttons = buttons.map((btn: any) => ({
                  label: btn.title || btn.label || "Open",
                  action: btn.action?.type || "post",
                }));
              }
            }
          } catch (err) {
            // Not JSON, ignore
          }
        }
      }
      // --- END PATCH ---

      const buttons: { label: string; action: string }[] = [];
      for (let i = 1; i <= 4; i++) {
        const buttonLabel = meta[`fc:frame:button:${i}`];
        if (buttonLabel) {
          const buttonAction = meta[`fc:frame:button:${i}:action`] || "post";
          buttons.push({ label: buttonLabel, action: buttonAction });
        }
      }

      if (buttons.length > 0 && frameData.buttons.length === 0) {
        frameData.buttons = buttons;
      }

      if (!frameData.title) {
        frameData.title = meta["fc:frame:title"] || meta["og:title"] || null;
      }
      if (!frameData.image) {
        frameData.image = meta["fc:frame:image"] || meta["og:image"] || null;
      }
      if (!frameData.postUrl || frameData.postUrl === fallbackUrl) {
        frameData.postUrl = meta["fc:frame:post_url"] || fallbackUrl;
      }
      if (!frameData.inputText) {
        frameData.inputText = !!meta["fc:frame:input:text"];
      }
    }
  } catch (e) {
    console.warn("Error extracting raw meta tags:", e);
  }

  if (frameData.buttons.length === 0) {
    if (safeParseResult.farcaster_v2?.status === "success") {
      const frame = safeParseResult.farcaster_v2.frame;

      if (!frameData.image) {
        frameData.image = frame.image || null;
      }

      if (!frameData.title) {
        frameData.title = frame.title || null;
      }

      if (frame.buttons && frame.buttons.length > 0) {
        frameData.buttons = frame.buttons.map((btn: { label?: string; action?: string }) => ({
          label: btn.label || "Open",
          action: btn.action || "post",
        }));
      }

      if (!frameData.inputText) {
        frameData.inputText = !!frame.input?.text;
      }

      if (frameData.postUrl === fallbackUrl) {
        frameData.postUrl = frame.postUrl || fallbackUrl;
      }

      return frameData;
    }

    if (safeParseResult.farcaster?.status === "success") {
      const frame = safeParseResult.farcaster.frame;

      if (!frameData.image) {
        frameData.image = frame.image || null;
      }

      if (!frameData.title) {
        frameData.title = frame.title || null;
      }

      if (frame.buttons && frame.buttons.length > 0) {
        frameData.buttons = frame.buttons.map((btn: { label?: string; action?: string }) => ({
          label: btn.label || "Open",
          action: btn.action || "post",
        }));
      }

      if (!frameData.inputText) {
        frameData.inputText = !!frame.inputText;
      }

      if (frameData.postUrl === fallbackUrl) {
        frameData.postUrl = frame.postUrl || fallbackUrl;
      }
    }
  }

  if (frameData.buttons.length === 0) {
    let defaultLabel = "Open";

    if (
      frameData.title?.toLowerCase().includes("read") ||
      fallbackUrl.includes("paragraph") ||
      fallbackUrl.includes("article")
    ) {
      defaultLabel = "Read";
    } else if (
      frameData.title?.toLowerCase().includes("watch") ||
      fallbackUrl.includes("video") ||
      fallbackUrl.includes("youtube")
    ) {
      defaultLabel = "Watch";
    } else if (fallbackUrl.includes("skatehive")) {
      defaultLabel = "Be Brave";
    }

    frameData.buttons = [{ label: defaultLabel, action: "post" }];
  }

  return frameData;
}

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
    const parseResult = await parseFramesWithReports({
      html,
      frameUrl: url,
      fallbackPostUrl: url,
      fromRequestMethod: "GET",
      parseSettings: {
        farcaster_v2: {
          parseManifest: true,
          strict: false,
        },
      },
    });
    let frameData = extractFrameData(parseResult, url);

    if (
      (!frameData.image || frameData.image === null) &&
      (!frameData.title || frameData.title === null) &&
      (!frameData.buttons || frameData.buttons.length === 0)
    ) {
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
    const parseResult = await parseFramesWithReports({
      html,
      frameUrl,
      fallbackPostUrl: frameUrl,
      fromRequestMethod: "POST",
      parseSettings: {
        farcaster_v2: {
          parseManifest: true,
          strict: false,
        },
      },
    });
    let frameData = extractFrameData(parseResult, frameUrl);

    if (
      (!frameData.image || frameData.image === null) &&
      (!frameData.title || frameData.title === null) &&
      (!frameData.buttons || frameData.buttons.length === 0)
    ) {
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