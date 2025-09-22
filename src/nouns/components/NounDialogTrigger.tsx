import { Noun } from "@nouns/data/noun/types";
import { ComponentProps, ReactNode } from "react";
import { LinkShallow } from "./ui/link";
import { cn } from "@nouns/utils/shadcn";

interface NounDialogTriggerProps
  extends Omit<ComponentProps<typeof LinkShallow>, "searchParam"> {
  noun: Noun;
  children: ReactNode;
}

export default function NounDialogTrigger({
  noun,
  children,
  className,
  ...props
}: NounDialogTriggerProps) {
  return (
    <LinkShallow
      searchParam={{ name: "nounId", value: noun.id }}
      className={cn("hover:cursor-pointer enabled:active:scale-100", className)}
      {...props}
    >
      {children}
    </LinkShallow>
  );
}
