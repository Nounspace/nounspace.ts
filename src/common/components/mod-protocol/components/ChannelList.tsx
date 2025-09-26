// Migrated from @mod-protocol/react-ui-shadcn/channel-list  
// Source: https://github.com/mod-protocol/mod/blob/main/packages/react-ui-shadcn/src/components/channel-list.tsx

"use client";

import * as React from "react";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

// Define Channel type based on Farcaster channel structure
type Channel = {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  follower_count?: number;
};

type ChannelListRef = {
  onKeyDown: (props: { event: Event }) => boolean;
};

type Props = {
  items: Array<Channel | null>;
  command: any;
};

export const ChannelList = forwardRef<ChannelListRef, Props>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (!item) return;
    props.command(item);
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: Event }) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (keyboardEvent.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (keyboardEvent.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  const noResults = props.items.length === 0;
  const hasItems = props.items.length && !noResults;

  return (
    <div
      className={mergeClasses(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      )}
      style={{ maxHeight: "300px" }}
    >
      {hasItems ? (
        props.items.map((item, index) =>
          !item ? null : (
            <div
              className={mergeClasses(
                "flex flex-row p-2 px-3 cursor-pointer gap-2 items-center",
                "hover:bg-accent hover:text-accent-foreground",
                index === selectedIndex && "bg-accent text-accent-foreground"
              )}
              key={item.id}
              onClick={() => selectItem(index)}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  // image may not be a square
                  backgroundImage: item.image_url ? `url(${item.image_url})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: !item.image_url ? "#f1f5f9" : undefined,
                }}
                className="rounded-md flex items-center justify-center text-slate-400"
              >
                {!item.image_url && "#"}
              </div>
              <div>
                <div className="font-bold text-sm">{item.name}</div>
                <div className="font-bold text-muted-foreground text-sm">
                  /{item.id}
                </div>
              </div>
            </div>
          )
        )
      ) : noResults ? (
        <div className="flex flex-row p-2 px-3">Not found</div>
      ) : (
        <div className="flex items-center gap-2 p-2 px-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ChannelList.displayName = "ChannelList";