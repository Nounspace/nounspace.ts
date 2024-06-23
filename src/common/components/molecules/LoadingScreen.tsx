import React from "react";
import Spinner from "../atoms/spinner";
import { isNil } from "lodash";

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
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
              {isNil(text) ? null : (
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-4xl lg:text-2xl font-semibold tracking-tight text-gray-100">
                    {text}
                  </h1>
                </div>
              )}
              <div className="self-center">
                <Spinner className="size-15" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
