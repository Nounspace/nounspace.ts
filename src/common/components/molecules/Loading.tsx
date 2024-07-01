import React from "react";
import Spinner from "../atoms/spinner";
import { isNil } from "lodash";

export default function Loading({ text }: { text?: string }) {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
      {isNil(text) ? null : (
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-4xl lg:text-2xl font-semibold tracking-tight text-black">
            {text}
          </h1>
        </div>
      )}
      <div className="self-center">
        <Spinner className="size-15" />
      </div>
    </div>
  );
}
