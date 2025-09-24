"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  ComponentProps,
} from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@nouns/utils/shadcn";

interface SortProviderInterface {
  sortValue: string;
  setSortValue: (search: string) => void;
}

const SortContext = createContext<SortProviderInterface | undefined>(undefined);

export function useSortContext() {
  const context = useContext(SortContext);
  if (!context) {
    throw new Error("useSortContext must be used within a SortProvider");
  }
  return context;
}

export default function SortProvider({
  children,
  defaultSortValue,
}: {
  defaultSortValue: string;
  children: ReactNode;
}) {
  const [sortValue, setSortValue] = useState<string>(defaultSortValue);

  return (
    <SortContext.Provider
      value={{
        sortValue,
        setSortValue,
      }}
    >
      {children}
    </SortContext.Provider>
  );
}

export function SortSelect({
  items,
  className,
  ...props
}: { items: { name: string; value: string }[] } & ComponentProps<
  typeof SelectTrigger
>) {
  const { sortValue, setSortValue } = useSortContext();

  return (
    <Select onValueChange={(value) => setSortValue(value)} value={sortValue}>
      <SelectTrigger
        className={cn("h-[36px] rounded-full", className)}
        {...props}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
