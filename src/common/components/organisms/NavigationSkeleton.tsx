import React from "react";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

const NavigationSkeleton: React.FC = () => {
  return (
    <aside
      id="logo-sidebar-skeleton"
      className="w-full transition-transform -translate-x-full sm:translate-x-0 border-r-2 bg-white"
      aria-label="Sidebar Skeleton"
    >
      <div className="pt-7 pb-12 h-full md:block hidden">
        <div className="flex flex-col h-full w-[270px] ml-auto">
          <div className="flex flex-col text-lg font-medium pb-3 px-4 overflow-auto">
            <div className="flex-auto">
              <ul className="space-y-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <li key={index}>
                    <div
                      className={mergeClasses(
                        "flex relative items-center p-2 text-gray-900 rounded-lg dark:text-white group w-full animate-pulse"
                      )}
                    >
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <span className="ms-3 w-24 h-4 bg-gray-300 rounded"></span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col flex-auto justify-between border-t px-4">
            <div className="mt-8 px-2">
              <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="pt-3 flex items-center gap-2 justify-center">
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default NavigationSkeleton; 