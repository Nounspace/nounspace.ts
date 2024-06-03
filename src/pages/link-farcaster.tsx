import React from "react";

export default function LinkFarcaster() {
  return (
      <div className="w-full max-w-full min-h-screen">
        <div
          className="relative w-full h-screen flex-col items-center grid lg:max-w-none lg:grid-cols-2 lg:px-0"
        >
          <div className="relative h-full flex-col bg-muted p-10 text-foreground flex">
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-gray-900 via-gray-700 to-stone-500" />
            <div className="relative z-20 mt-16 lg:mt-24">
            </div>
          </div>
        </div>
      </div>
  );
}
