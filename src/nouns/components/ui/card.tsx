import { cn } from "@nouns/utils/shadcn";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("border-border-primary grow rounded-2xl border-2 p-4", className)} {...props}>
      {children}
    </div>
  );
}
