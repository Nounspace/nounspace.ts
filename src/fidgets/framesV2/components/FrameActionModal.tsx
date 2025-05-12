"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Import the FrameMetadata type from wherever it's defined
interface FrameMetadata {
  image: string | null;
  title: string | null;
  buttons: { label: string; action: string }[];
  inputText: boolean;
  error: string | null;
  loading: boolean;
  postUrl?: string;
}

interface FrameActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  frameUrl: string;
  buttonIndex?: number;
  fid?: number;
  currentFrameData?: FrameMetadata; // Add this prop to receive frame data from parent
}

export default function FrameActionModal({
  isOpen,
  onClose,
  frameUrl,
  buttonIndex = 1,
  fid = 20721,
  currentFrameData,
}: FrameActionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [frameData, setFrameData] = useState<{
    image: string | null;
    title: string | null;
    postUrl: string | null;
    buttons: { label: string; action: string }[];
    error: string | null;
  }>({
    image: null,
    title: null,
    postUrl: null,
    buttons: [],
    error: null,
  });

  // Get the original button label from the current frame data
  const getOriginalButtonLabel = (): string => {
    if (!currentFrameData?.buttons || !buttonIndex || buttonIndex < 1) {
      return "Continue";
    }

    const btn = currentFrameData.buttons[buttonIndex - 1];
    return btn?.label || "Continue";
  };

  useEffect(() => {
    if (!isOpen || !frameUrl) return;

    // If we have current frame data, let's use the image, title and buttons from it initially
    if (currentFrameData) {
      setFrameData({
        image: currentFrameData.image,
        title: currentFrameData.title,
        postUrl: currentFrameData.postUrl || null,
        buttons: currentFrameData.buttons || [],
        error: null,
      });
    }

    const fetchFrameAction = async () => {
      try {
        setLoading(true);
        // Don't reset frame data if we have current data
        if (!currentFrameData) {
          setFrameData({
            image: null,
            title: null,
            postUrl: null,
            buttons: [],
            error: null,
          });
        }

        // Process the frame action through our API endpoint
        const response = await fetch("/frames", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            frameUrl,
            buttonIndex,
            fid,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to process frame action: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Frame action response:", data);

        setFrameData({
          image: data.image || null,
          title: data.title || null,
          postUrl: data.postUrl || null,
          buttons: data.buttons || [],
          error: null,
        });
      } catch (error) {
        console.error("Error in frame action:", error);
        setFrameData({
          image: currentFrameData?.image || null,
          title: currentFrameData?.title || null,
          postUrl: null,
          buttons: currentFrameData?.buttons || [],
          error:
            error instanceof Error
              ? error.message
              : "Failed to process frame action",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFrameAction();
  }, [isOpen, frameUrl, buttonIndex, fid, currentFrameData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
        backdropFilter: "blur(5px)",
      }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          width: "100%",
          maxWidth: "36rem",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "90vh",
          maxHeight: "90vh",
          animation: "fadeInUp 0.3s ease-out forwards",
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#1f2937",
            }}
          >
            {frameData.title || "Frame Action"}
          </h3>
          <button
            onClick={onClose}
            style={{
              color: "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "256px",
                backgroundColor: "#f9fafb",
              }}
            >
              <p
                style={{
                  color: "#4b5563",
                }}
              >
                Processing {getOriginalButtonLabel()} action...
              </p>
            </div>
          ) : frameData.error ? (
            <div
              style={{
                padding: "24px",
                color: "#ef4444",
              }}
            >
              <p>{frameData.error}</p>
            </div>
          ) : frameData.postUrl ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <iframe
                ref={iframeRef}
                src={frameData.postUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title="Frame Content"
              />
            </div>
          ) : (
            <>
              {frameData.image && (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1.91/1",
                  }}
                >
                  <Image
                    src={frameData.image}
                    alt={frameData.title || "Frame image"}
                    fill
                    style={{
                      objectFit: "cover",
                    }}
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                  />
                </div>
              )}

              <div style={{ padding: "24px" }}>
                <p style={{ color: "#374151", marginBottom: "16px" }}>
                  {frameData.title
                    ? `Action completed: ${frameData.title}`
                    : "Action completed successfully"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
