import React from "react";
import FrameRenderer from "./FrameRenderer";

interface FrameslayoutProps {
  frameUrl: string;
}

const Frameslayout: React.FC<FrameslayoutProps> = ({ frameUrl }) => {
  if (!frameUrl || !frameUrl.startsWith("http")) {
    return null;
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
        padding: 0,
        margin: 0,
        overflow: "hidden",
      }}
    >
      <FrameRenderer frameUrl={frameUrl} isConnected={true} fid={20721} />
    </div>
  );
};

export default Frameslayout;
