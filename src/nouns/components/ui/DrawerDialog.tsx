"use client";
import { useScreenSize } from "@nouns/hooks/useScreenSize";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./dialogBase";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "./drawer";
import { HTMLAttributes, ReactNode, useMemo, useState } from "react";
import { cn } from "@nouns/utils/shadcn";

export function DrawerDialog({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  nonDismissable?: boolean;
}) {
  const [openUncontrolled, setOpenUncontrolled] = useState<boolean>(false);
  const screenSize = useScreenSize();

  const { openInternal, setOpenInternal } = useMemo(() => {
    return {
      openInternal: open ?? openUncontrolled,
      setOpenInternal: onOpenChange ?? setOpenUncontrolled,
    };
  }, [open, onOpenChange, openUncontrolled, setOpenUncontrolled]);

  if (!screenSize) return null;

  return screenSize == "sm" ? (
    <Drawer
      open={openInternal}
      onOpenChange={setOpenInternal}
      repositionInputs={false}
    >
      {children}
    </Drawer>
  ) : (
    <Dialog open={openInternal} onOpenChange={setOpenInternal}>
      {children}
    </Dialog>
  );
}

export function DrawerDialogTrigger(
  props: { asChild?: boolean } & HTMLAttributes<HTMLButtonElement>,
) {
  const screenSize = useScreenSize();
  if (!screenSize) return null;
  return screenSize == "sm" ? (
    <DrawerTrigger {...props} />
  ) : (
    <DialogTrigger {...props} />
  );
}

export function DrawerDialogContent({
  ignoreOutsideInteractions,
  ...props
}: {
  ignoreOutsideInteractions?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  const screenSize = useScreenSize();
  if (!screenSize) return null;
  return screenSize == "sm" ? (
    <DrawerContent
      onInteractOutside={(event) =>
        ignoreOutsideInteractions ? event.preventDefault() : {}
      }
      {...props}
    />
  ) : (
    <DialogContent
      onInteractOutside={(event) =>
        ignoreOutsideInteractions ? event.preventDefault() : {}
      }
      {...props}
    />
  );
}

export function DrawerDialogContentInner({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <div
        className={cn(
          "relative flex h-full min-h-0 w-full flex-col items-center overflow-y-auto p-6",
          className,
        )}
        {...props}
      >
        {children}
      </div>
      <div className="hidden h-[env(safe-area-inset-bottom)] w-full pwa:block" />
    </>
  );
}

export function DrawerDialogTitle(props: HTMLAttributes<HTMLDivElement>) {
  const screenSize = useScreenSize();
  if (!screenSize) return null;
  return screenSize == "sm" ? (
    <DrawerTitle {...props} />
  ) : (
    <DialogTitle {...props} />
  );
}
