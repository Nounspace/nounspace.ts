import * as React from "react";

import { cn } from "@nouns/utils/shadcn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-xl border-2 border-border-primary bg-white p-3 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-content-secondary/70 disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-content-primary",
          // "focus-visible:ring-semantic-accent/50 ring-offset-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
