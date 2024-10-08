import React, { ReactNode, useState, useEffect } from "react";
import { isUndefined } from "lodash";
import useWindowSize from "@/common/lib/hooks/useWindowSize";

export default function SpaceLoading({
  profile,
  tabBar,
}: {
  profile?: ReactNode;
  tabBar?: ReactNode;
}) {
  const [rowHeight, setRowHeight] = useState(70);
  const { height } = useWindowSize();
  const maxRows = 12;
  const cols = 12;
  const margin = [16, 16];
  const containerPadding = [16, 16];
  const magicBase = profile ? 64 + 160 : 64;

  useEffect(() => {
    setRowHeight(
      height
        ? (height -
            magicBase -
            margin[0] * (maxRows - 1) -
            containerPadding[0] * 2) /
            maxRows
        : rowHeight,
    );
  }, [height]);

  return (
    <>
      <div className="user-theme-background w-full h-full relative flex-col">
        <div className="w-full transition-all duration-100 ease-out">
          <div className="w-full transition-all duration-100 ease-out h-full">
            <div className={"h-full flex flex-col"}>
              <div className="flex-1 grid-container grow">
                <div
                  className="relative grid-overlap w-full h-full opacity-50"
                  style={{
                    transition: "background-color 1000ms linear",
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${maxRows}, ${rowHeight}px)`,
                    gridGap: `${margin[0]}px`,
                    rowGap: `${margin[1]}px`,
                    padding: `${containerPadding[0]}px`,
                    background: "rgba(200, 227, 248, 0.3)",
                  }}
                >
                  {[...Array(cols * maxRows)].map((_, i) => (
                    <div
                      className="rounded-lg animate-pulse"
                      key={i}
                      style={{
                        backgroundColor: "rgba(200, 227, 248, 0.5)",
                        outline: "1px dashed rgba(200, 227, 248, 0.8)",
                        animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                        animationDelay: `${(i % cols) * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
