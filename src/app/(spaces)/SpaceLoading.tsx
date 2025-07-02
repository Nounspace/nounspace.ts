"use client";

import React from "react";
import useWindowSize from "@/common/lib/hooks/useWindowSize";

export default function SpaceLoading({ hasProfile, hasFeed }) {
  const { height } = useWindowSize();
  const maxRows = hasProfile ? 8 : 12;
  const cols = hasFeed ? 7 : 12;
  const margin = [16, 16];
  const containerPadding = [16, 16];
  const magicBase = hasProfile ? 64 + 160 : 64;
  const rowHeight = height
    ? (height - magicBase - margin[0] * (maxRows - 1) - containerPadding[0] * 2) / maxRows
    : 70;

  return (
    <>
      <div className="user-theme-background w-full h-full relative flex-col">
        <div className="w-full transition-all duration-100 ease-out">
          <div className="h-full flex flex-col">
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
                }}
              >
                {[...Array(cols * maxRows)].map((_, i) => (
                  <div
                    key={i}
                    className="ripple-square"
                    style={{
                      backgroundColor: "rgba(200, 227, 248, 0.8)",
                      outline: "1px dashed rgba(200, 227, 248, 0.8)",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
