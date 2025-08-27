import React from "react";

interface PhoneFrameProps {
  width?: number;
  height?: number;
  className?: string;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({
  width = 344,
  height = 744,
  className = "pointer-events-none select-none relative z-0"
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 344 744"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <mask id="phoneMask">
        <rect width="344" height="744" fill="white" />
        {/* Cut out the screen area */}
        <rect
          x="12"
          y="32"
          width="320"
          height="680"
          rx="28"
          ry="28"
          fill="black"
        />
      </mask>
    </defs>
    
    {/* Phone outer frame with screen cutout */}
    <rect
      x="2"
      y="2"
      width="340"
      height="740"
      rx="42"
      ry="42"
      fill="#1a1a1a"
      stroke="#333"
      strokeWidth="2"
      mask="url(#phoneMask)"
    />
    
    {/* Top speaker/camera area */}
    <rect
      x="140"
      y="12"
      width="64"
      height="8"
      rx="4"
      ry="4"
      fill="#555"
    />
    
    {/* Home indicator */}
    <rect
      x="152"
      y="720"
      width="40"
      height="4"
      rx="2"
      ry="2"
      fill="#555"
    />
    
    {/* Side buttons */}
    <rect
      x="0"
      y="120"
      width="4"
      height="32"
      rx="2"
      ry="2"
      fill="#333"
    />
    <rect
      x="0"
      y="180"
      width="4"
      height="60"
      rx="2"
      ry="2"
      fill="#333"
    />
    <rect
      x="340"
      y="140"
      width="4"
      height="80"
      rx="2"
      ry="2"
      fill="#333"
    />
  </svg>
);

export default PhoneFrame; 