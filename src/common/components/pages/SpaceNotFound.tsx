import React from "react";
import Navigation from "../organisms/Navigation";
import { noop } from "lodash";

export default async function SpaceNotFound({
  handle,
}: {
  handle: string | string[] | undefined;
}) {
  return (
    <>
      <div className="flex w-full h-full">
        <div
          className={"w-3/12 flex mx-auto transition-all duration-100 ease-out"}
        >
          <Navigation isEditable={false} setEditMode={noop} />
        </div>

        <div className={"w-9/12 transition-all duration-100 ease-out p-8"}>
          Could not find a user with handle {handle}
        </div>
      </div>
    </>
  );
}
