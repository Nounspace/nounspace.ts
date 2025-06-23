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
        minWidth: "500px", // Minimum width for better responsiveness
        maxWidth: "800px", // Maximum width for larger screens
        height: "400px", // Optimized height for feed display
        minHeight: "400px",
        maxHeight: "700px", // Maximum height for larger screens
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
