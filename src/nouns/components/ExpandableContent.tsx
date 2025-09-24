"use client";
import { cn } from "@paperclip-labs/whisk-sdk";
import clsx from "clsx";
import { HTMLAttributes, ReactNode, useEffect, useRef, useState } from "react";

interface ExpandableContentProps {
  maxCollapsedHeight: number;
  children: ReactNode;
}

export default function ExpandableContent({
  children,
  maxCollapsedHeight,
}: ExpandableContentProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if the content exceeds the max collapsed height
  useEffect(() => {
    if (contentRef.current) {
      setNeedsExpansion(contentRef.current.scrollHeight > maxCollapsedHeight);
    }
  }, [children, maxCollapsedHeight]);

  return (
    <button
      onClick={() => setExpanded(true)}
      className={cn("flex flex-col justify-start text-start")}
      disabled={!needsExpansion || expanded}
    >
      <div
        ref={contentRef}
        className={clsx("relative overflow-hidden")}
        style={{ maxHeight: expanded ? "none" : maxCollapsedHeight }}
      >
        {children}
        <div
          className={clsx(
            "flex justify-end",
            "absolute bottom-0 left-0 right-0 w-full pt-4",
            "bg-gradient-to-t from-white to-transparent",
            needsExpansion && !expanded ? "block" : "hidden",
          )}
        >
          <div className="bg-gradient-to-t from-white to-transparent pl-2 underline paragraph-sm">
            More
          </div>
        </div>
      </div>
    </button>
  );
}
