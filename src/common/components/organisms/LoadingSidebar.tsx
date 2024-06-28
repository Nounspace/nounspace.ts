import React from "react";
import BrandHeader from "../molecules/BrandHeader";

export default function LoadingSidebar() {
  return (
    <aside
      id="logo-sidebar"
      className="left-4 top-4 bottom-4 z-8 w-9/12 transition-transform -translate-x-full sm:translate-x-0 bg-white"
      aria-label="Sidebar"
    >
      <div className="flex-row h-full">
        <div className="h-full px-4 py-4 overflow-y-auto border border-blue-100 rounded-xl relative bg-card">
          <BrandHeader />
          <div className="text-lg font-medium">
            <ul className="space-y-2"></ul>
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
              <div className="mt-5 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
