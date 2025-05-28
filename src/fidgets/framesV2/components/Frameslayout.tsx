import React from "react";
import FrameRenderer from "./FrameRenderer";

interface FrameslayoutProps {
  frameUrl: string;
  collapsed?: boolean;
  title?: string;
  headingFont?: string;
}

const Frameslayout: React.FC<FrameslayoutProps> = ({
  frameUrl,
  collapsed = false,
  title,
  headingFont,
}) => {
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
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "stretch",
        padding: 0,
        margin: 0,
        overflow: "hidden",
      }}
    >
      {!collapsed && title ? (
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
      <div style={{ flex: 1 }}>
        <FrameRenderer
          frameUrl={frameUrl}
          isConnected={true}
          fid={20721}
          collapsed={collapsed}
          customTitle={title}
        />
      </div>
    </div>
  );
};

export default Frameslayout;
