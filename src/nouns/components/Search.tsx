"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  ComponentProps,
  useMemo,
  useEffect,
} from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { debounce } from "lodash";
import { cn } from "@nouns/utils/shadcn";

interface SearchProviderInterface {
  searchValue: string;
  debouncedSearchValue: string;
  setSearchValue: (search: string) => void;
}

const SearchContext = createContext<SearchProviderInterface | undefined>(
  undefined,
);

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
}

export default function SearchProvider({ children }: { children: ReactNode }) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  const debouncedChangeHandler = useMemo(
    () => debounce((value) => setDebouncedSearchValue(value), 200),
    [],
  );

  useEffect(() => {
    debouncedChangeHandler(searchValue);
  }, [searchValue, debouncedChangeHandler]);

  return (
    <SearchContext.Provider
      value={{
        searchValue,
        debouncedSearchValue,
        setSearchValue,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function SearchInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  const { searchValue, setSearchValue } = useSearchContext();
  return (
    <div className={cn("relative w-full", className)}>
      <Input
        className={cn(
          "h-[44px] w-full rounded-full border bg-background-secondary p-4 pl-[48px]",
          className,
        )}
        onChange={(e) => setSearchValue(e.target.value)}
        value={searchValue}
        {...props}
      />
      <Search
        size={20}
        className="absolute left-[16px] top-1/2 -translate-y-1/2 stroke-content-primary"
      />
    </div>
  );
}
