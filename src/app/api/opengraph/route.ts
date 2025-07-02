import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Nounspace/1.0; +https://nounspace.com)",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract OpenGraph metadata
    const getMetaContent = (property: string): string | null => {
      const element = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
      return element?.getAttribute("content") || null;
    };

    const title = getMetaContent("og:title") || 
                  getMetaContent("twitter:title") || 
                  document.querySelector("title")?.textContent || 
                  null;

    const description = getMetaContent("og:description") || 
                       getMetaContent("twitter:description") || 
                       getMetaContent("description") || 
                       null;

    const image = getMetaContent("og:image") || 
                  getMetaContent("twitter:image") || 
                  null;

    const siteName = getMetaContent("og:site_name") || 
                     new URL(url).hostname;

    const ogData = {
      title,
      description,
      image,
      siteName,
      url,
    };

    // console.log(`📊 OpenGraph data extracted:`, ogData);

    return NextResponse.json(ogData);
  } catch (error) {
    console.error(`❌ Failed to fetch OpenGraph data for ${url}:`, error);
    
    // Return minimal fallback data
    return NextResponse.json({
      title: new URL(url).hostname,
      description: null,
      image: null,
      siteName: new URL(url).hostname,
      url,
    });
  }
}
