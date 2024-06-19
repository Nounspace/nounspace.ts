import { FidgetConfig, FidgetSettings } from "@/common/fidgets";
import React from "react";

const PlusIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19M12 19L12 5"
        stroke="#1C64F2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export interface FidgetTrayProps {
  trayFidgetStorage: {
    [key: string]: {
      instanceConfig: FidgetConfig<FidgetSettings>;
      fidgetName: string;
      id: string;
    };
  };
}

export const FidgetTray: React.FC<FidgetTrayProps> = ({
  trayFidgetStorage,
}) => {
  return (
    <div className="w-full h-full mx-4 inset-x-auto shadow-lg shadow-inner h-full"></div>
  );
};

export default FidgetTray;
