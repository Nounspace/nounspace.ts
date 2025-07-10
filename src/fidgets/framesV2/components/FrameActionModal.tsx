"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Modal from "@/common/components/molecules/Modal";
import { FidgetSpinner } from "react-loader-spinner";
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
  modalTitle?: string;
}

export default function FrameActionModal({
  isOpen,
  onClose,
  frameUrl,
  buttonIndex = 1,
  fid = 20721,
  currentFrameData,
  modalTitle,
}: FrameActionModalProps) {
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

  // TODO: FIX BUTTON LABELS

  // const getOriginalButtonLabel = (): string => {
  //   if (!currentFrameData?.buttons || !buttonIndex || buttonIndex < 1) {
  //     return "Open";
  //   }

  //   const btn = currentFrameData.buttons[buttonIndex - 1];
  //   return btn?.label || "Open";
  // };

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
        const response = await fetch("/api/frames", {
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

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      setOpen={(open) => {
        if (!open) onClose();
      }}
      title={modalTitle}
      showClose
      overlay
    >
      {/* Content */}
      <div
        className="flex-1 overflow-auto"
        style={{ minHeight: "90vh ", padding: "-20px" }}
      // hide scrollbar
      >
        {loading ? (
          <div
            className="flex items-center justify-center w-full"
            style={{ minHeight: "90vh", height: "90vh" }}
          >
            <FidgetSpinner
              visible={true}
              height="80"
              width="80"
              ariaLabel="fidget-spinner-loading"
              wrapperStyle={{}}
              wrapperClass="fidget-spinner-wrapper"
            />
          </div>
        ) : frameData.error ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p>{frameData.error}</p>
          </div>
        ) : frameData.postUrl ? (
          <div className="relative w-full h-[60vh] min-h-[300px]">
            <iframe
              ref={iframeRef}
              src={frameData.postUrl}
              style={{ width: "100%", height: "90vh", border: "none" }}
              title="Frame Content"
            />
          </div>
        ) : (
          <>
            {frameData.image && (
              <div
                className="relative w-full"
                style={{ aspectRatio: "1.91/1" }}
              >
                <Image
                  src={frameData.image}
                  alt={frameData.title || "Frame image"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority
                />
              </div>
            )}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                {frameData.title
                  ? `Action completed: ${frameData.title}`
                  : "Action completed successfully"}
              </p>
            </div>
          </>
        )}
      </div>
      {/* Footer */}
      {/* <div className="border-t border-gray-200 pt-3 flex justify-end gap-2 mt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
        >
          Close
        </button>
      </div> */}
    </Modal>
  );
}
