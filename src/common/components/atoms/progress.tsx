import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { mergeClasses } from "@/common/lib/utils/mergeClasses";

type CustomProgressProps = {
  indicatorStyles?: object;
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
    CustomProgressProps
>(({ className, indicatorStyles, value, ...props }, ref) => {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={mergeClasses(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          ...(indicatorStyles || {}),
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
