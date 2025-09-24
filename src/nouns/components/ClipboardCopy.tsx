"use client";
import { ToastContext, ToastType } from "@nouns/providers/toast";
import { cn } from "@nouns/utils/shadcn";
import { HTMLAttributes, ReactNode, useCallback, useContext } from "react";

interface ClipboardCopyProps extends HTMLAttributes<HTMLDivElement> {
  copyContent: string;
  children: ReactNode;
}

export function ClipboardCopy({
  copyContent,
  children,
  className,
  ...props
}: ClipboardCopyProps) {
  const { addToast } = useContext(ToastContext);
  const copy = useCallback(() => {
    navigator.clipboard
      .writeText(copyContent)
      .then(() => {
        addToast?.({ content: "Copied to clipboard", type: ToastType.Success });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        addToast?.({
          content: "Copy not supported on this device",
          type: ToastType.Failure,
        });
      });
  }, [copyContent, addToast]);

  return (
    <div
      onClick={copy}
      className={cn("hover:cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  );
}
