// Migrated from @mod-protocol/react-ui-shadcn/ui/skeleton
// Source: https://github.com/mod-protocol/mod/blob/main/packages/react-ui-shadcn/src/components/ui/skeleton.tsx

import React from "react";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={mergeClasses("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };