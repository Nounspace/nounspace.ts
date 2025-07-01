import React from "react";
import Loading from "../molecules/Loading";

const LoadingScreen: React.FC<{ text?: string }> = ({
  text,
}: {
  text?: string;
}) => {
  return (
    <div className="relative h-full flex-col p-10 text-foreground flex">
      <div className="relative z-[2] mt-16 lg:mt-24 lg:mb-24">
        <Loading text={text} />
      </div>
    </div>
  );
};

export default LoadingScreen;
