import React from "react";

export default function LoadingSidebar() {
  return (
    <aside
      id="logo-sidebar"
      className="h-full flex-row flex bg-white transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="flex-1 w-[270px] h-full pt-12 flex-col flex px-4 py-4 overflow-y-hidden border-r">
        <div className="h-full flex-col">
          <div className="text-lg font-medium">
            <ul className="space-y-2"></ul>
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
              <div className="mt-5 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-24">
        <div className="w-full h-screen flex flex-col justify-start items-center gap-2 bg-sky-50 py-7 px-6 overflow-auto"></div>
      </div>
    </aside>
  );
}
