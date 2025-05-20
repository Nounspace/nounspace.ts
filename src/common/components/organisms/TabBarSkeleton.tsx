import React from "react";

const TabBarSkeleton: React.FC = () => {
  return (
    <div className="sticky top-14 md:static z-40 flex flex-row justify-center h-16 overflow-y-scroll w-full bg-white">
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