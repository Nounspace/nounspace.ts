"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import FrameActionModal from "./FrameActionModal";

interface FrameRendererProps {
  frameUrl: string;
  isConnected?: boolean;
  fid?: number | null;
  collapsed?: boolean;
  customTitle?: string;
  title?: string;
  headingFont?: string;
  showTitle?: boolean;
}

interface FrameMetadata {
  image: string | null;
  title: string | null;
  buttons: { label: string; action: string }[];
  inputText: boolean;
  error: string | null;
  loading: boolean;
  postUrl?: string;
}

export default function FrameRenderer({
  frameUrl,
  isConnected = false,
  fid = null,
  collapsed = false,
  customTitle,
  title,
  headingFont,
  showTitle = true,
}: FrameRendererProps) {
  const [frameData, setFrameData] = useState<FrameMetadata>({
    image: null,
    title: null,
    buttons: [],
    inputText: false,
    error: null,
    loading: true,
  });
  const [inputValue, setInputValue] = useState("");
  const [imgError, setImgError] = useState(false);

  // Modal state for button actions (only used when collapsed)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);

  useEffect(() => {
    const fetchFrame = async () => {
      if (!frameUrl) return;

      try {
        setFrameData((prev) => ({ ...prev, loading: true, error: null }));
        setImgError(false);

        // Fetch the frame metadata through our proxy endpoint with user context if available
        const params = new URLSearchParams({
          url: frameUrl,
        });

        if (isConnected && fid) {
          params.append("fid", fid.toString());
        }

        const response = await fetch(`/api/frames?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch frame: ${response.statusText}`);
        }

        const data = await response.json();

        // Log the frame data for debugging
        console.log("FrameRenderer - Frame data received:", {
          frameUrl,
          data,
          hasImage: !!data.image,
          imageUrl: data.image,
          isFrame: data.isFrame,
        });

        setFrameData({
          image: data.image || null,
          title: data.title || null,
          buttons: data.buttons || [],
          inputText: !!data.inputText,
          postUrl: data.postUrl || null,
          error: null,
          loading: false,
        });
      } catch (error) {
        console.error("FrameRenderer - Error fetching frame:", {
          frameUrl,
          error,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        setFrameData((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to load frame",
          loading: false,
        }));
      }
    };

    fetchFrame();
  }, [frameUrl, isConnected, fid]);

  const handleButtonClick = (buttonIndex: number) => {
    setActiveButton(buttonIndex);
    setIsModalOpen(true);
  };

  // If no URL has been entered yet, show a placeholder
  if (!frameUrl) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "white",
          position: "relative",
          padding: "32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "400px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              Enter a Farcaster Frame URL
            </h2>
            <p style={{ color: "#4b5563" }}>
              Enter a valid Frame URL in the input field above and click
              &quot;Load Frame&quot; to view it.
            </p>
            <div style={{ marginTop: "24px", color: "#4b5563" }}>
              <p style={{ fontSize: "14px" }}>Try these example frames:</p>
              <ul
                style={{ marginTop: "8px", color: "#3b82f6", fontSize: "14px" }}
              >
                <li style={{ marginTop: "4px" }}>
                  https://frame.onchnsummer.xyz
                </li>
                <li style={{ marginTop: "4px" }}>https://framesjs.org</li>
                <li style={{ marginTop: "4px" }}>https://skatehive.app</li>
                <li style={{ marginTop: "4px" }}>https://gnars.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (frameData.loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "400px",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#f8f9fa",
          position: "relative",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          role="status"
          aria-live="polite"
          aria-label="Loading frame"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid #e5e7eb",
                borderTop: "2px solid #3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
              aria-hidden="true"
            ></div>
            <p
              style={{
                color: "#6b7280",
                fontWeight: 500,
                fontSize: "14px",
                margin: 0,
              }}
            >
              Loading frame...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (frameData.error) {
    return (
      <div
        style={{
          display: "flex",
          color: "#dc2626",
          fontSize: "14px",
          padding: "16px",
          backgroundColor: "white",
          border: "1px solid #ef4444",
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Error: {frameData.error}</p>
      </div>
    );
  }

  if (!collapsed && frameData.postUrl) {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <iframe
          src={frameData.postUrl}
          title={frameData.title || "Frame"}
          style={{ width: "100%", height: "100%", border: "none" }}
          className="size-full"
        />
      </div>
    );
  }

  // Responsive layout for fidget container
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "stretch",
        padding: 0,
        margin: 0,
        overflow: "hidden",
      }}
    >
      {/* Optional title header */}
      {!collapsed && showTitle && title ? (
        <div style={{ padding: "12px" }}>
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: headingFont || "var(--user-theme-headings-font)",
            }}
          >
            {title}
          </h2>
        </div>
      ) : null}

      {/* Frame content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          background: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Frame image (responsive, fills container) */}
        {frameData.image && !imgError ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          >
            <Image
              src={frameData.image}
              alt={frameData.title || "Frame image"}
              fill
              style={{ objectFit: "cover" }}
              sizes="100vw"
              priority
              onError={(e) => {
                console.error("FrameRenderer - Image failed to load:", {
                  frameUrl,
                  imageUrl: frameData.image,
                  error: e,
                  target: e.target,
                });
                setImgError(true);
              }}
              onLoad={() => {
                console.log("FrameRenderer - Image loaded successfully:", {
                  frameUrl,
                  imageUrl: frameData.image,
                });
              }}
            />
          </div>
        ) : null}
        {/* Overlay for title, input, and buttons (centered, responsive) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            width: "100%",
            background: "rgba(255,255,255,0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 0 24px 0",
          }}
        >
          {frameData.title && (
            <div
              style={{
                fontWeight: 500,
                color: "#1f2937",
                fontSize: 16,
                marginBottom: 8,
                textAlign: "center",
                width: "100%",
                wordBreak: "break-word",
              }}
            >
              {frameData.title}
            </div>
          )}
          {frameData.inputText && (
            <div
              style={{
                width: "100%",
                maxWidth: 600,
                marginBottom: 8,
                padding: "0 16px",
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  padding: 8,
                  border: "1px solid #d1d5db",
                  borderRadius: 4,
                  width: "100%",
                  color: "#1f2937",
                  fontSize: 16,
                }}
                placeholder="Enter text..."
              />
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 8,
              width: "100%",
              maxWidth: 600,
              justifyContent: "center",
              flexDirection: "column",
              padding: "0 16px",
            }}
          >
            {frameData.buttons.map((button, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(index + 1)}
                style={{
                  border: "1px solid #d1d5db",
                  fontSize: 16,
                  color: "#374151",
                  borderRadius: 4,
                  backgroundColor: "#fff",
                  padding: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  minWidth: 0,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
        {/* Modal for button actions */}
        <FrameActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          frameUrl={frameUrl}
          buttonIndex={activeButton || 1}
          fid={fid || 20721}
          currentFrameData={frameData}
          modalTitle={customTitle}
        />
      </div>
    </div>
  );
}
