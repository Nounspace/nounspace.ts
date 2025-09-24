"use client";
import { SECONDS_PER_DAY, SECONDS_PER_MONTH, SECONDS_PER_YEAR } from "@nouns/utils/constants";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@nouns/components/ui/select";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type TimeSelector = "1M" | "3M" | "6M" | "1Y" | "MAX";

export const TIME_SELECTOR_FILTER_KEY = "time";

// 1 day margin on all time frames
export const DATA_FOR_TIME_SELECTOR: Record<
  TimeSelector,
  { rangeS: number | undefined; name: string; shortName: string }
> = {
  "1M": {
    rangeS: SECONDS_PER_MONTH + SECONDS_PER_DAY,
    name: "Last 30 days",
    shortName: "30d",
  },
  "3M": {
    rangeS: SECONDS_PER_MONTH * 3 + SECONDS_PER_DAY,
    name: "Last 90 days",
    shortName: "90d",
  },
  "6M": {
    rangeS: SECONDS_PER_MONTH * 6 + SECONDS_PER_DAY,
    name: "Last 180 days",
    shortName: "180d",
  },
  "1Y": {
    rangeS: SECONDS_PER_YEAR + SECONDS_PER_DAY,
    name: "Last 1 year",
    shortName: "1y",
  },
  MAX: { rangeS: undefined, name: "All time", shortName: "all" },
};

const DEFAULT_SELECTOR = "1Y";

export default function TimeSelector() {
  const timeSelector = useTimeSelector();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set(TIME_SELECTOR_FILTER_KEY, value);
      window.history.pushState(null, "", `?${params.toString()}`);
    },
    [searchParams]
  );
  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">{DATA_FOR_TIME_SELECTOR[timeSelector].name}</SelectTrigger>
      <SelectContent>
        {Object.entries(DATA_FOR_TIME_SELECTOR).map(([key, value], i) => (
          <SelectItem value={key} key={i}>
            {value.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useTimeSelector(): TimeSelector {
  const searchParams = useSearchParams();
  const timeFilter = searchParams?.get(TIME_SELECTOR_FILTER_KEY);

  return useMemo(() => {
    const timeSelector = timeFilter as TimeSelector;
    return timeSelector ?? DEFAULT_SELECTOR;
  }, [timeFilter]);
}
