import React from "react";
import Navigation from "../organisms/Navigation";
import { noop } from "lodash";
import Image from "next/image";

export default function SpaceNotFound({ src = "/images/UserNotFound.png" }) {
  return (
    <>
      <div className="flex w-full h-full">
        <div
          className={"w-3/12 flex mx-auto transition-all duration-100 ease-out"}
        >
          <Navigation isEditable={false} enterEditMode={noop} />
        </div>

        <div className="w-9/12 transition-all duration-100 ease-out p-8 flex">
          <div className="col-span-6 md:col-span-4 lg:col-span-3 aspect-video w-full bg-gray-100 relative self-center">
            <Image
              src={src}
              alt="User not found"
              layout="fill"
              objectFit="cover"
            ></Image>
          </div>
        </div>
      </div>
    </>
  );
}
