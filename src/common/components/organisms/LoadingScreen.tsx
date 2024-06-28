import React from "react";
import Loading from "../molecules/Loading";

const LoadingScreen: React.FC<{ text?: string }> = ({
  text,
}: {
  text?: string;
}) => {
  return (
    <div className="w-full max-w-full min-h-screen">
      <div className="relative w-full h-screen flex-col items-center grid lg:max-w-none lg:grid-cols lg:px-0">
        <div className="relative h-full flex-col bg-muted p-10 text-foreground flex">
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-gray-900 via-gray-700 to-stone-500" />
          <div className="relative z-1 mt-16 lg:mt-24">
            <Loading text={text} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
