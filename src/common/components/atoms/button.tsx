import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { mergeClasses } from "@/common/lib/utils/mergeClasses";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary:
          "text-white bg-blue-600 hover:bg-blue-600 hover:bg-blue-700 text-white active:bg-blue-800",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-blue-600 hover:bg-sky-100",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-xl",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 rounded-md py-2 text-md",
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 rounded-md px-5 text-sm",
        lg: "h-10 rounded-md px-8",
        icon: "h-10 w-10 rounded-md",
      },
      width: {
        auto: "w-auto flex-1",
        full: "w-full",
      },
      withIcon: {
        true: "gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  variant?:
    | "default"
    | "primary"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "md" | "lg" | "icon";
  width?: "auto" | "full";
  withIcon?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, withIcon, width, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={mergeClasses(
          buttonVariants({ variant, size, withIcon, width, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
