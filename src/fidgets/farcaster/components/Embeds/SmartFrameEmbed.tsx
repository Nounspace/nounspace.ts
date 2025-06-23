import React, { useState, useEffect } from "react";
import FrameV2Embed from "./FrameV2Embed";
import FrameEmbed from "./FrameEmbed";
import {
  isFrameV2Url,
  isLikelyFrameUrl,
} from "@/common/lib/utils/frameDetection";
interface SmartFrameEmbedProps {
  url: string;
}

const SmartFrameEmbed: React.FC<SmartFrameEmbedProps> = ({ url }) => {
  const [isFrameV2, setIsFrameV2] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    let isCancelled = false;

    const checkFrameType = async () => {
      // Only set loading if not already cancelled
      if (!isCancelled) {
        setIsLoading(true);
      }

      try {
        // Quick heuristic check first
        if (!isLikelyFrameUrl(url)) {
          // If it doesn't look like a frame URL or is blacklisted, skip expensive check
          if (!isCancelled) {
            setIsFrameV2(false);
            setIsLoading(false);
          }
          return;
        }

        // Looks like a frame URL, check thoroughly
        const isV2 = await isFrameV2Url(url);

        // Only update state if this effect hasn't been cancelled
        if (!isCancelled) {
          setIsFrameV2(isV2);
          setIsLoading(false);
        }
      } catch (error) {
        // Enhanced error handling with explicit logging
        if (!isCancelled) {
          console.warn(`Frame detection failed for URL: ${url}`, {
            error: error instanceof Error ? error.message : error,
            url,
            timestamp: new Date().toISOString(),
          });

          // On error, default to false (use legacy frame system)
          setIsFrameV2(false);
          setIsLoading(false);
        }
      }
    };

    checkFrameType();

    // Cleanup function to prevent race conditions
    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [url]);

  // Don't show loading state here - let FrameRenderer handle it
  // This eliminates the double loading issue

  // If we detected frame metadata, use FrameV2, otherwise fallback to legacy
  if (isFrameV2 || isLoading) {
    return <FrameV2Embed url={url} />;
  } else {
    return <FrameEmbed url={url} showError={false} />;
  }
};

export default SmartFrameEmbed;
