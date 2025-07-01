import React from "react";

const TabBarSkeleton: React.FC = () => {
  return (
    <div className="flex flex-row justify-start h-16 overflow-x-auto no-scrollbar w-full z-[3] bg-white">
      <div className="flex flex-row gap-4 grow items-start m-4 tabs">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-300 rounded-lg h-10 w-24 animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
};

export default TabBarSkeleton; 