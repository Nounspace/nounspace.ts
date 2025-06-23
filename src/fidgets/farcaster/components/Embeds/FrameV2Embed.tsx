import React from "react";
import Frameslayout from "@/fidgets/framesV2/components/Frameslayout";

interface FrameV2EmbedProps {
  url: string;
  key?: string;
}

const FrameV2Embed: React.FC<FrameV2EmbedProps> = ({ url }) => {
  return (
    <div
      style={{
        minWidth: "min(500px, 100vw - 2rem)", // Responsive minimum width
        maxWidth: "min(800px, 100vw - 2rem)", // Responsive maximum width
        height: "clamp(300px, 50vh, 700px)", // Responsive height
        minHeight: "300px",
        maxHeight: "min(700px, 80vh)", // Responsive maximum height
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        display: "flex", // Use flexbox for proper sizing
        flexDirection: "column",
        position: "relative", // Ensure proper positioning
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          display: "flex",
        }}
      >
        <Frameslayout
          frameUrl={url}
          collapsed={true} // Always use collapsed mode for inline cast embeds
          title={undefined} // No title in cast embeds to save space for feed
        />
      </div>
    </div>
  );
};

export default FrameV2Embed;
