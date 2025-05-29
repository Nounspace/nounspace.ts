"use client";
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { FarcasterMention } from "../types";
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { debounce } from "lodash";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type MentionListRef = {
  onKeyDown: (props: { event: Event }) => boolean;
};

type Props = {
  items: Array<FarcasterMention | null>;
  command: any;
};

export const MentionList = forwardRef<MentionListRef, Props>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(true);

  const selectItem = debounce((index: number) => {
    const item = props.items[index];
    if (item) {
      setSelectedIndex(index); // Ensure the state updates with the clicked item
      const mentionText = `@${item.username}`; // The text that will appear in the editor
      props.command({ id: item.username, text: mentionText, fid: item.fid }); // Pass the username and FID to the parent
    }
  }, 200);

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length,
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    // console.log(selectedIndex, props.items);
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: Event }) => {
      if (!(event instanceof KeyboardEvent)) {
        return false;
      }

      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        // console.log("downHandler");
        // console.log(selectedIndex);
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  const noResults = props.items.length === 1 && props.items[0] === null;

  return (
    // Menu messes with focus which we don't want here
    <div
      tabIndex={0}
      className="overflow-y-auto z-100 min-w-[20rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      style={{ maxHeight: "300px", pointerEvents: "auto" }}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
    >
      {props.items.length && !noResults ? (
        props.items.map((item, index) =>
          !item ? null : (
            <div
              className={cn(
                "flex flex-row p-2 px-3 cursor-pointer gap-2 items-center hover:bg-accent hover:text-accent-foreground",
                index === selectedIndex && "bg-accent text-accent-foreground",
              )}
              key={item.username}
              onClick={() => selectItem(index)}
            >
              <div
                style={{
                  borderRadius: "100%",
                  width: "48px",
                  height: "48px",
                  backgroundImage: `url(${item.avatar_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onClick={() => selectItem(index)}
              />
              <div>
                <div className="font-bold text-sm">{item.display_name}</div>
                <div className="font-bold text-muted-foreground text-sm">
                  @{item.username}
                </div>
              </div>
            </div>
          ),
        )
      ) : noResults ? (
        <div className="flex flex-row p-2 px-3">Not found</div>
      ) : (
        <div className="flex items-center space-x-2 p-2 px-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[50px]" />
          </div>
        </div>
      )}
    </div>
  );
});

MentionList.displayName = "MentionList";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}
