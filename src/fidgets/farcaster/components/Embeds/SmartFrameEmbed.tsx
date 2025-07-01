import React, { useState, useEffect } from "react";
import FrameV2Embed from "./FrameV2Embed";
import FrameEmbed from "./FrameEmbed";
import OpenGraphEmbed from "./OpenGraphEmbed";
import {
  isFrameV2Url,
  isLikelyFrameUrl,
} from "@/common/lib/utils/frameDetection";

interface SmartFrameEmbedProps {
  url: string;
}

const SmartFrameEmbed: React.FC<SmartFrameEmbedProps> = ({ url }) => {
  const [isFrameV2, setIsFrameV2] = useState<boolean | null>(null);
  const [isFrameV1, setIsFrameV1] = useState<boolean | null>(null);
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
        // Check for Frame V2 metadata
        const isV2 = await isFrameV2Url(url);

        // Check for Frame V1 using the existing heuristic
        const isV1 = !isV2 && isLikelyFrameUrl(url);

        // Only update state if this effect hasn't been cancelled
        if (!isCancelled) {
          setIsFrameV2(isV2);
          setIsFrameV1(isV1);
          setIsLoading(false);
        }
      } catch (error) {
        // On error, default to false for both frame types
        if (!isCancelled) {
          setIsFrameV2(false);
          setIsFrameV1(false);
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

  // Show loading state
  if (isLoading) {
    return <FrameV2Embed url={url} />;
  }

  // If it's a Frame V2, render with FrameV2Embed
  if (isFrameV2) {
    return <FrameV2Embed url={url} />;
  }

  // If it's a Frame V1, render with legacy FrameEmbed
  if (isFrameV1) {
    return <FrameEmbed url={url} showError={false} />;
  }

  // If it's neither Frame V1 nor V2, render as OpenGraph metadata card
  return <OpenGraphEmbed url={url} />;
};

export default SmartFrameEmbed;
