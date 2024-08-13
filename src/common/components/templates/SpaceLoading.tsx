import React, { ReactNode, useMemo } from "react";
import { isUndefined } from "lodash";
import useWindowSize from "@/common/lib/hooks/useWindowSize";
import { useIsMounted } from "@/common/lib/hooks/useIsMounted";

export default function SpaceLoading({ profile }: { profile?: ReactNode }) {
  const isMounted = useIsMounted();
  const maxRows = 12;
  const cols = 12;
  const margin = [16, 16];
  const containerPadding = [16, 16];
  const { height } = useWindowSize();
  const rowHeight = useMemo(
    () =>
      height
        ? Math.round(
            // The 64 magic number here is the height of the tabs bar above the grid
            (height - 64 - margin[0] * maxRows - containerPadding[0] * 2) /
              maxRows,
          )
        : 70,
    [height],
  );

  // isMounted check fixes hydration mismatch
  return !isMounted() ? null : (
    <>
      <div className="w-full transition-all duration-100 ease-out h-full">
        <div className={"h-full flex flex-col"}>
          {!isUndefined(profile) ? <div> {profile} </div> : null}
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
                  className="rounded-lg"
                  key={i}
                  style={{
                    backgroundColor: "rgba(200, 227, 248, 0.5)",
                    outline: "1px dashed rgba(200, 227, 248, 0.8)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
