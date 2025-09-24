"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@nouns/components/ui/select";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type ActivitySelector = "all" | "deposit" | "redeem" | "swap";

export const ACTIVITY_SELECTOR_FILTER_KEY = "activity";

export const DATA_FOR_ACTIVITY_SELECTOR: Record<
  ActivitySelector,
  { name: string }
> = {
  all: {
    name: "All",
  },
  swap: {
    name: "Swap",
  },
  deposit: {
    name: "Deposit",
  },
  redeem: {
    name: "Redeem",
  },
};

const DEFAULT_SELECTOR = "all" as ActivitySelector;

export default function ActivitySelector() {
  const activitySelector = useActivitySelector();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set(ACTIVITY_SELECTOR_FILTER_KEY, value);
      window.history.pushState(null, "", `?${params.toString()}`);
    },
    [searchParams],
  );

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className="w-fit">
        {DATA_FOR_ACTIVITY_SELECTOR[activitySelector].name}
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DATA_FOR_ACTIVITY_SELECTOR).map(([key, value], i) => (
          <SelectItem value={key} key={i}>
            {value.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useActivitySelector(): ActivitySelector {
  const searchParams = useSearchParams();
  const activityFilter = searchParams?.get(ACTIVITY_SELECTOR_FILTER_KEY);

  return useMemo(() => {
    const activity = activityFilter as ActivitySelector;
    return activity ?? DEFAULT_SELECTOR;
  }, [activityFilter]);
}
