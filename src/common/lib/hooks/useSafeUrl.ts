import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { isValidUrl } from "@/common/lib/utils/url";

/**
 * Sanitize a URL using DOMPurify by passing it through an anchor tag.
 * This ensures dangerous protocols like `javascript:` are stripped.
 */
const sanitizeUrl = (url: string): string | null => {
  const sanitizedHtml = DOMPurify.sanitize(`<a href="${url}"></a>`, {
    ALLOWED_TAGS: ["a"],
    ALLOWED_ATTR: ["href"],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
  const match = sanitizedHtml.match(/href="([^"']*)"/i);
  return match ? match[1] : null;
};

// Returns sanitized URL string, or null if invalid or unsafe
export const useSafeUrl = (url: string): string | null => {
  return useMemo(() => {
    if (!url) return null;

    const sanitized = sanitizeUrl(url);
    if (!sanitized) {
      return null;
    }

    return isValidUrl(sanitized) ? sanitized : null;
  }, [url]);
};

export default useSafeUrl;
