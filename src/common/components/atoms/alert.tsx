import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

const alertVariants = cva(
  "relative w-full flex flex-col justify-center rounded-lg py-3 px-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4",
  {
    variants: {
      variant: {
        default:
          "border bg-background text-foreground/80 [&>svg]:text-gray-400",
        destructive: "text-red-700 bg-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={mergeClasses(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={mergeClasses(
      "mb-1 font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={mergeClasses(
      "text-sm [&_p]:leading-relaxed [&>b]:font-semibold",
      className,
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
