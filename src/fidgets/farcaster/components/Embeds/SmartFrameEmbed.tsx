import React, { useState, useEffect } from "react";
import FrameV2Embed from "./FrameV2Embed";
import FrameEmbed from "./FrameEmbed";
import {
  isFrameV2Url,
  isLikelyFrameUrl,
} from "@/common/lib/utils/frameDetection";

interface SmartFrameEmbedProps {
  url: string;
  key?: string;
}

const SmartFrameEmbed: React.FC<SmartFrameEmbedProps> = ({ url }) => {
  const [isFrameV2, setIsFrameV2] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFrameType = async () => {
      setIsLoading(true);

      // Quick heuristic check first
      if (!isLikelyFrameUrl(url)) {
        // If it doesn't look like a frame URL or is blacklisted, skip expensive check
        setIsFrameV2(false);
        setIsLoading(false);
        return;
      }
      
      // Looks like a frame URL, check thoroughly
      try {
        const isV2 = await isFrameV2Url(url);
        setIsFrameV2(isV2);
      } catch {
        setIsFrameV2(false);
      }

      setIsLoading(false);
    };

    checkFrameType();
  }, [url]);

  // Show loading state briefly
  if (isLoading) {
    return (
      <div
        style={{
          width: "100%",
          height: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          color: "#666",
        }}
      >
        Loading frame...
      </div>
    );
  }

  // If we detected frame metadata, use FrameV2, otherwise fallback to legacy
  if (isFrameV2) {
    return <FrameV2Embed url={url} />;
  } else {
    return <FrameEmbed url={url} showError={false} />;
  }
};

export default SmartFrameEmbed;
