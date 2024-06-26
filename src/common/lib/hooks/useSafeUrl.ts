import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { isValidUrl } from "@/common/lib/utils/url";

const UNSAFE_URL_PATTERNS = [
  /javascript:/i,
  /^data:/i,
  /<script/i,
  /%3Cscript/i,
];

// Ensure the URL does not contain JavaScript or data URIs
const isSafeUrl = (
  url: string,
  disallowPatterns: RegExp[] = UNSAFE_URL_PATTERNS,
): boolean => {
  return !disallowPatterns.some((p) => p.test(url));
};

// Returns sanitized URL string, or null if invalid or unsafe
export const useSafeUrl = (
  url: string,
  disallowPatterns: RegExp[] = UNSAFE_URL_PATTERNS,
): string | null => {
  return useMemo(() => {
    if (!url) return null;

    const sanitized = DOMPurify.sanitize(url, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    if (!isValidUrl(sanitized)) {
      return null;
    }

    if (!isSafeUrl(sanitized, disallowPatterns)) {
      console.warn("Unsafe URL detected.");
      return null;
    }
    return sanitized;
  }, [url, disallowPatterns]);
};

export default useSafeUrl;
