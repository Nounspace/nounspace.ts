import React, { useState, useEffect } from "react";
import FrameRenderer from "@/fidgets/framesV2/components/FrameRenderer";
import { useFarcasterSigner } from "@/fidgets/farcaster/index";

interface FrameV2EmbedProps {
  url: string;
  showError?: boolean;
}

const FrameV2Embed: React.FC<FrameV2EmbedProps> = ({
  url,
  showError = false,
}) => {
  const { fid } = useFarcasterSigner("frame-v2-embed");
  const [isFrameV2Compatible, setIsFrameV2Compatible] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the URL is Frame v2 compatible by attempting to fetch frame metadata
    const checkFrameCompatibility = async () => {
      try {
        const response = await fetch(`/api/frames?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          // Consider it Frame v2 compatible if it has image or buttons
          const isCompatible = !!(data.image || (data.buttons && data.buttons.length > 0));
          setIsFrameV2Compatible(isCompatible);
        } else {
          setIsFrameV2Compatible(false);
        }
      } catch (error) {
        console.error('Frame v2 compatibility check failed:', error);
        setIsFrameV2Compatible(false);
      }
    };

    if (url) {
      checkFrameCompatibility();
    }
  }, [url]);

  // Show loading state while checking compatibility
  if (isFrameV2Compatible === null) {
    return (
      <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading frame...</span>
      </div>
    );
  }

  // If not Frame v2 compatible, return null (will fall back to legacy frame or other embed)
  if (!isFrameV2Compatible) {
    return null;
  }

  // Render Frame v2
  return (
    <div className="w-full max-w-full mx-auto rounded-lg overflow-hidden border border-gray-200">
      <FrameRenderer
        frameUrl={url}
        isConnected={!!fid}
        fid={fid}
        collapsed={false}
      />
    </div>
  );
};

export default FrameV2Embed;
