import React, { useEffect, useState } from "react";
import { parseZoraUrl } from "./zoraUtils";

interface ZoraEmbedProps {
  url: string;
}

type OG = {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  siteName?: string | null;
  url?: string | null;
};

const ZoraEmbed: React.FC<ZoraEmbedProps> = ({ url }) => {
  const [og, setOg] = useState<OG | null>(null);
  const [loading, setLoading] = useState(true);
  const parsed = parseZoraUrl(url);

  useEffect(() => {
    let cancelled = false;
    const fetchOG = async () => {
      if (!parsed) {
        setLoading(false);
        return;
      }

      // Only call opengraph for https pages
      if (!parsed.pageUrl.startsWith("https://")) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const resp = await fetch(`/api/opengraph?url=${encodeURIComponent(parsed.pageUrl)}`);
        if (!resp.ok) throw new Error("open graph fetch failed");
        const data = await resp.json();
        if (!cancelled) setOg(data);
      } catch (e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOG();
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Build trade link - MVP: point to the page URL discovered
  const tradeUrl = parsed?.pageUrl ?? url;

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 w-full max-w-2xl">
        <div className="animate-pulse">
          <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-300 h-3 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (og && (og.image || og.title)) {
    const siteLabel = og.siteName || (() => {
      try { return new URL(tradeUrl).hostname; } catch { return "zora.co"; }
    })();

    // Try to mimic Zora's card: subtle gray gradient header with inset preview that looks like a framed post
    return (
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header / preview area (gradient) */}
          <div className="bg-gradient-to-b from-gray-200 via-gray-100 to-gray-100 p-4">
            <div className="relative mx-auto max-w-3xl">
              {/* Inner rounded preview card (lighter) */}
              <a href={tradeUrl} target="_blank" rel="noopener noreferrer" className="block">
                <div className="mx-auto w-full rounded-lg bg-white shadow-inner" style={{maxWidth: 720}}>
                  <div className="p-4">
                    <div className="relative rounded-md overflow-hidden bg-white" style={{minHeight: 120}}>
                      {og.image ? (
                        <img src={og.image!} alt={og.title || "Zora preview"} className="object-cover w-full h-48 md:h-40 lg:h-48" />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <span className="text-sm text-gray-400">Preview</span>
                        </div>
                      )}
                      {/* top-left badge */}
                      <div className="absolute left-3 top-3 px-2 py-1 bg-white text-xs font-medium rounded-full text-gray-800">Zora</div>
                      {/* top-right site text */}
                      <div className="absolute right-3 top-3 text-xs text-gray-500">{siteLabel}</div>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Footer: title + actions */}
          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {og.title && <div className="font-semibold text-gray-900 text-base line-clamp-2">{og.title}</div>}
                {og.description && <div className="text-sm text-gray-600 mt-1 line-clamp-2">{og.description}</div>}
              </div>

              <div className="flex-shrink-0">
                <a
                  href={tradeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                >
                  Trade
                </a>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">{siteLabel}</div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Zora</div>
          {parsed?.contract && (
            <div className="text-xs text-gray-500">{parsed.contract}{parsed?.tokenId ? ` • #${parsed.tokenId}` : ''}</div>
          )}
        </div>

        <div>
          <a
            href={tradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
          >
            View
          </a>
        </div>
      </div>
    </div>
  );
};

export default ZoraEmbed;
