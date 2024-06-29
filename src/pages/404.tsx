import React from "react";
import Navigation from "@/common/components/organisms/Navigation";
import { noop } from "lodash";
import Image from "next/image";

export default function Custom404() {
  return (
    <>
      <div className="flex w-full h-full">
        <div
          className={"w-3/12 flex mx-auto transition-all duration-100 ease-out"}
        >
          <Navigation isEditable={false} enterEditMode={noop} />
        </div>

        <div className={"w-9/12 transition-all duration-100 ease-out p-8"}>
          <Image src="/images/404.png" alt="User not found"></Image>
        </div>
      </div>
    </>
  );
}
