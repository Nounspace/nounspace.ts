import React from "react";
import LoadingSidebar from "../organisms/LoadingSidebar";

export default function SpaceLoading() {
  return (
    <div className="flex">
      <div className="w-3/12 flex mx-auto transition-all duration-100 ease-out">
        <LoadingSidebar />
      </div>

      <div className="w-9/12 transition-all duration-100 ease-out">
        Loading...
      </div>
    </div>
  );
}
