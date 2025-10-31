import { NextRequest, NextResponse } from "next/server";

// Mark route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  // Only allow http and https URLs
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    // If URL constructor fails, treat as unsupported
    return NextResponse.json({
      title: url,
      description: null,
      image: null,
      siteName: url,
      url,
      error: "Unsupported or invalid URL scheme"
    });
  }

  if (parsedUrl.protocol !== "https:") {
    // Only allow https URLs for security; reject http and other protocols
    return NextResponse.json({
      title: parsedUrl.hostname || url,
      description: null,
      image: null,
      siteName: parsedUrl.hostname || url,
      url,
      error: `Only https URLs are allowed. Unsupported URL protocol: ${parsedUrl.protocol}`
    });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Referer": "https://nounspace.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      // Handle common HTTP errors gracefully
      if (response.status === 403) {
        throw new Error(`Access denied by ${parsedUrl.hostname}. Site may be blocking automated requests.`);
      } else if (response.status === 404) {
        throw new Error(`Page not found: ${response.statusText}`);
      } else if (response.status >= 500) {
        throw new Error(`Server error from ${parsedUrl.hostname}: ${response.statusText}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const html = await response.text();

    // Extract meta content using regex (lightweight alternative to jsdom)
    // Handles both single and double quotes, escaped quotes, and whitespace variations
    const getMetaContent = (property: string): string | null => {
      // Escape special regex characters in property name
      const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Match meta tags with property or name attribute, handling various quote styles
      // Supports: property="value", property='value', property=value
      const patterns = [
        // Double quotes
        new RegExp(`<meta[^>]+(?:property|name)=["']${escapedProperty}["'][^>]+content=["']([^"']*)["']`, 'is'),
        // Single quotes
        new RegExp(`<meta[^>]+(?:property|name)=['"]${escapedProperty}['"][^>]+content=['"]([^'"]*)['"]`, 'is'),
        // Content attribute first
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapedProperty}["']`, 'is'),
        // Content attribute first, single quotes
        new RegExp(`<meta[^>]+content=['"]([^'"]*)['"'][^>]+(?:property|name)=['"]${escapedProperty}['"]`, 'is'),
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          // Decode HTML entities
          return match[1]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .trim();
        }
      }
      return null;
    };

    // Extract title tag content
    const getTitle = (): string | null => {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/is);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .trim();
      }
      return null;
    };

    const title = getMetaContent("og:title") || 
                  getMetaContent("twitter:title") || 
                  getTitle() || 
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

    // ...existing code...

    return NextResponse.json(ogData);
  } catch (error) {
    
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
