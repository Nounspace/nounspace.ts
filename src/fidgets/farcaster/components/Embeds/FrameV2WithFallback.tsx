import React, { useState, useEffect } from "react";
import FrameV2FeedEmbed from "./FrameV2FeedEmbed";
import FrameEmbed from "./FrameEmbed";

interface FrameV2WithFallbackProps {
  url: string;
  showError?: boolean;
}

const FrameV2WithFallback: React.FC<FrameV2WithFallbackProps> = ({
  url,
  showError = false,
}) => {
  const [useFrameV2, setUseFrameV2] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the URL is Frame v2 compatible
    const checkFrameV2Compatibility = async () => {
      try {
        const response = await fetch(
          `/api/frames?url=${encodeURIComponent(url)}`
        );
        if (response.ok) {
          const data = await response.json();
          // Consider it Frame v2 compatible if it has frame metadata
          const isFrameV2 = !!(
            data.image ||
            (data.buttons && data.buttons.length > 0)
          );
          setUseFrameV2(isFrameV2);
        } else {
          setUseFrameV2(false);
        }
      } catch (error) {
        console.error("Frame v2 compatibility check failed:", error);
        setUseFrameV2(false);
      }
    };

    if (url) {
      checkFrameV2Compatibility();
    }
  }, [url]);

  // Show loading state while checking compatibility
  if (useFrameV2 === null) {
    return (
      <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading frame...</span>
      </div>
    );
  }

  // Use Frame v2 if compatible
  if (useFrameV2) {
    return <FrameV2FeedEmbed url={url} />;
  } else {
    // Fall back to legacy frame
    return <FrameEmbed url={url} showError={showError} />;
  }
};

export default FrameV2WithFallback;
