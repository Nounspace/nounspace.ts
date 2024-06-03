import React from "react";
import QRCodeBase from "react-qr-code";

type QRCodeProps =  React.ComponentPropsWithoutRef<typeof QRCodeBase> & {
  quietZonePadding?: string;
  quietZoneBorderRadius?: string;
  quietZoneColor?: string;
  maxWidth?: number;
};

const QRCode = ({ quietZonePadding, quietZoneBorderRadius, quietZoneColor, maxWidth, ...props }: QRCodeProps) => {
  return (
    <div 
      style={{
        background: quietZoneColor || 'white',
        padding: quietZonePadding || '16px',
        borderRadius: quietZoneBorderRadius || "8px",
        height: "auto",
        width: "100%",
        maxWidth,
      }}
    >
      <QRCodeBase 
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        viewBox={`0 0 256 256`}
        {...props}
      />
    </div>
  );
};

export default QRCode;