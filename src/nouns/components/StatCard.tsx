import { HTMLAttributes } from "react";
import TitlePopover from "./TitlePopover";
import Card from "./ui/card";
import { cn } from "@nouns/utils/shadcn";

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  popoverDescription: string;
  value: string;
}

export default function StatCard({ title, popoverDescription, value, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <TitlePopover title={title}>{popoverDescription}</TitlePopover>
      <div className="label-lg">{value}</div>
    </Card>
  );
}
