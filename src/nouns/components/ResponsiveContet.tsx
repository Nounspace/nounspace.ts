"use client";
import { ScreenSize, useScreenSize } from "@nouns/hooks/useScreenSize";
import { ReactNode } from "react";

interface ResponseContentProps {
  children: ReactNode;
  screenSizes: ScreenSize[];
}

export function ResponsiveContent({
  children,
  screenSizes,
}: ResponseContentProps) {
  const actualScreenSize = useScreenSize();
  if (screenSizes.includes(actualScreenSize)) {
    return <>{children}</>;
  }
}
