export interface FidgetTrayProps {}
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

export const FidgetTray: React.FC<FidgetTrayProps> = ({}) => {
  return (
    <div className="w-full h-full mx-4">
      <div className="inset-x-auto shadow-lg shadow-inner h-full">
        <button className="flex-col justify-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
          <div className="">
            <PlusIcon />
          </div>
          <span className="ml-4 mr-4">Add Fidget</span>
        </button>
      </div>
    </div>
  );
};

export default FidgetTray;
