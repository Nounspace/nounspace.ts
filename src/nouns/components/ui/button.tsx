import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@nouns/utils/shadcn";
import clsx from "clsx";

const buttonVariants = cva(
  clsx(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl",
    "transition-all enabled:clickable-active",
    "disabled:pointer-events-none disabled:bg-background-disabled disabled:fill-gray-200 disabled:text-gray-200 disabled:opacity-50",
    "ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semantic-accent/50 focus-visible:ring-offset-2",
  ),
  {
    variants: {
      variant: {
        primary: "bg-content-primary text-white hover:bg-gray-800",
        secondary:
          "bg-white text-content-primary border-2 hover:bg-background-secondary",
        negative:
          "bg-semantic-negative text-white hover:bg-semantic-negative-dark",
        positive: "bg-blue-400 text-white hover:bg-blue-600",
        ghost: "bg-transparent text-black hover:bg-background-secondary",
        "rounded-icon":
          "bg-background-primary rounded-full border-2 border-background-secondary hover:border-transparent hover:bg-background-secondary disabled:border-transparent",
        unstyled: "",
      },
      size: {
        default: "px-8 py-3",
        icon: "p-3",
        "icon-slim": "p-1",
        fit: "p-0 m-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {" "}
        {typeof children === "string" ? (
          <span className="label-md">{children}</span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
