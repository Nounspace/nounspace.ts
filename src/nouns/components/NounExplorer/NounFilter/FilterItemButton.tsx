"use client";
import { ButtonHTMLAttributes } from "react";
import { cn } from "@nouns/utils/shadcn";
import { Check } from "lucide-react";

interface FilterItemButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isChecked: boolean;
}

export function FilterItemButton({ isChecked, children, ...props }: FilterItemButtonProps) {
  return (
    <button
      className="hover:bg-background-secondary *:hover:border-content-primary flex w-full items-center justify-between rounded-xl px-2 py-3"
      {...props}
    >
      {children}
      <ViewOnlyCheckbox checked={isChecked} />
    </button>
  );
}

function ViewOnlyCheckbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={cn(
        "border-border-primary peer flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
        "ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
        checked && "bg-content-primary border-none text-gray-50"
      )}
    >
      {checked && <Check className="h-4 w-4" strokeWidth={4} />}
    </div>
  );
}
