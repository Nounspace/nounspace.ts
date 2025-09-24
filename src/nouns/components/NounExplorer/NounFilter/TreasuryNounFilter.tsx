import { useSearchParams } from "next/navigation";
import { FilterItemButton } from "./FilterItemButton";
import { useCallback, useMemo } from "react";
import Icon from "../../ui/Icon";
import { scrollToNounExplorer } from "@nouns/utils/scroll";

export const ONLY_TREASURY_NOUNS_FILTER_KEY = "onlyTreasuryNouns";

export default function TreasuryNounFilter() {
  const searchParams = useSearchParams();

  const isChecked = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    return params.get(ONLY_TREASURY_NOUNS_FILTER_KEY) === "1";
  }, [searchParams]);

  const handleOnlyInstantSwapFilterChange = useCallback(
    (checked: boolean) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (!checked) {
        params.delete(ONLY_TREASURY_NOUNS_FILTER_KEY);
      } else {
        params.set(ONLY_TREASURY_NOUNS_FILTER_KEY, "1");
      }

      window.history.pushState(null, "", `?${params.toString()}`);
      scrollToNounExplorer();
    },
    [searchParams]
  );

  return (
    <FilterItemButton isChecked={isChecked} onClick={() => handleOnlyInstantSwapFilterChange(!isChecked)}>
      <div className="flex items-center gap-2">
        <Icon icon="treasury" size={20} className="fill-content-primary" />
        <h6>Treasury Nouns</h6>
      </div>
    </FilterItemButton>
  );
}
