"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@nouns/components/ui/select";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type CurrencySelector = "USD" | "ETH";

export const CURRENCY_SELECTOR_FILTER_KEY = "currency";

export const DATA_FOR_CURRENCY_SELECTOR: Record<CurrencySelector, { name: string }> = {
  ETH: {
    name: "ETH",
  },
  USD: {
    name: "USD",
  },
};

const DEFAULT_SELECTOR = "ETH" as CurrencySelector;

export default function CurrencySelector() {
  const currencySelector = useCurrencySelector();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set(CURRENCY_SELECTOR_FILTER_KEY, value);
      window.history.pushState(null, "", `?${params.toString()}`);
    },
    [searchParams]
  );

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className="w-[100px]">{DATA_FOR_CURRENCY_SELECTOR[currencySelector].name}</SelectTrigger>
      <SelectContent>
        {Object.entries(DATA_FOR_CURRENCY_SELECTOR).map(([key, value], i) => (
          <SelectItem value={key} key={i}>
            {value.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useCurrencySelector(): CurrencySelector {
  const searchParams = useSearchParams();
  const currencyFilter = searchParams?.get(CURRENCY_SELECTOR_FILTER_KEY);

  return useMemo(() => {
    const currency = currencyFilter as CurrencySelector;
    return currency ?? DEFAULT_SELECTOR;
  }, [currencyFilter]);
}
