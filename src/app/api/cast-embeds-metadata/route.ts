import { NextResponse, type NextRequest } from "next/server";
import { load } from "cheerio";

type MetadataImage = {
  url: string;
  height?: number;
  width?: number;
};

type MetadataResponse = {
  title: string;
  description: string;
  publisher: string;
  image?: MetadataImage;
};

const USER_AGENT =
  "nounspace-metadata-fetcher/1.0 (+https://www.nounspace.com)";

const normalizeImageUrl = (value: string | undefined, baseUrl: string) => {
  if (!value) return undefined;

  try {
    return new URL(value, baseUrl).toString();
  } catch (error) {
    console.warn("Failed to resolve image url", value, error);
    return undefined;
  }
};

const toNumber = (value: string | undefined) => {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

async function getMetadataForUrl(url: string): Promise<MetadataResponse | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Metadata fetch failed", url, response.status);
      return null;
    }

    const html = await response.text();
    const $ = load(html);
    const title =
      $("meta[property='og:title']").attr("content") ||
      $("meta[name='twitter:title']").attr("content") ||
      $("title").first().text() ||
      url;
    const description =
      $("meta[property='og:description']").attr("content") ||
      $("meta[name='description']").attr("content") ||
      "";
    const publisher =
      $("meta[property='og:site_name']").attr("content") ||
      new URL(url).hostname;
    const imageUrl =
      $("meta[property='og:image']").attr("content") ||
      $("meta[name='twitter:image']").attr("content");

    const imageHeight = toNumber(
      $("meta[property='og:image:height']").attr("content"),
    );
    const imageWidth = toNumber(
      $("meta[property='og:image:width']").attr("content"),
    );

    const normalizedImage = normalizeImageUrl(imageUrl, url);

    return {
      title,
      description,
      publisher,
      image: normalizedImage
        ? {
            url: normalizedImage,
            height: imageHeight,
            width: imageWidth,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching metadata for", url, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const urls: unknown = body?.urls ?? body;

    if (!Array.isArray(urls)) {
      return NextResponse.json(
        { error: "Request body must contain an array of urls" },
        { status: 400 },
      );
    }

    const uniqueUrls = Array.from(new Set(urls)).filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    );

    const results: Record<string, MetadataResponse | null> = {};

    await Promise.all(
      uniqueUrls.map(async (url) => {
        const metadata = await getMetadataForUrl(url);
        results[url] = metadata;
      }),
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Invalid metadata request", error);
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }
}
