import React, { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/common/components/molecules/Modal";
import FrameRenderer from "@/fidgets/framesV2/components/FrameRenderer";
import { useFarcasterSigner } from "@/fidgets/farcaster/index";

interface FrameV2FeedEmbedProps {
  url: string;
}

interface FrameData {
  image: string | null;
  title: string | null;
  buttons: { label: string; action: string }[];
  inputText: boolean;
  error: string | null;
  postUrl?: string;
}

const FrameV2FeedEmbed: React.FC<FrameV2FeedEmbedProps> = ({ url }) => {
  const { fid } = useFarcasterSigner("frame-v2-feed");
  const [frameData, setFrameData] = useState<FrameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFrameData = async () => {
      try {
        const response = await fetch(
          `/api/frames?url=${encodeURIComponent(url)}`
        );
        if (response.ok) {
          const data = await response.json();
          setFrameData(data);
        } else {
          setFrameData(null);
        }
      } catch (error) {
        console.error("Failed to fetch frame data:", error);
        setFrameData(null);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchFrameData();
    }
  }, [url]);

  const handleClick = () => {
    // Open frame in modal
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading frame...</span>
      </div>
    );
  }

  if (!frameData || (!frameData.image && (!frameData.buttons || frameData.buttons.length === 0))) {
    return null; // Not a valid frame
  }

  return (
    <>
      <div
        className="w-full max-w-full mx-auto rounded-lg overflow-hidden border border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-colors"
        onClick={handleClick}
      >
        {/* Frame preview image */}
        {frameData.image && !imgError ? (
          <div className="relative w-full h-48">
            <Image
              src={frameData.image}
              alt={frameData.title || "Frame preview"}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 400px"
              onError={() => setImgError(true)}
            />
            {/* Overlay to indicate it's interactive */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity" />
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Frame
            </div>
          </div>
        ) : null}
        
        {/* Frame info */}
        <div className="p-3">
          {frameData.title && (
            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {frameData.title}
            </h4>
          )}
          
          {/* Show first button as preview */}
          {frameData.buttons && frameData.buttons.length > 0 && (
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                {frameData.buttons[0].label}
              </button>
              {frameData.buttons.length > 1 && (
                <span className="text-xs text-gray-500">
                  +{frameData.buttons.length - 1} more
                </span>
              )}
            </div>
          )}
          
          {frameData.inputText && (
            <div className="mt-2 text-xs text-gray-500">
              📝 Input required
            </div>
          )}
        </div>
      </div>

      {/* Modal for full frame interaction */}
      <Modal
        open={showModal}
        setOpen={setShowModal}
        title="Frame"
        showClose={true}
      >
        <div style={{ minHeight: "400px", width: "100%" }}>
          <FrameRenderer
            frameUrl={url}
            isConnected={!!fid}
            fid={fid}
            collapsed={false}
          />
        </div>
      </Modal>
    </>
  );
};

export default FrameV2FeedEmbed;
