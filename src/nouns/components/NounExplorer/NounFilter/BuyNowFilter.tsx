import { useSearchParams } from "next/navigation";
import { FilterItemButton } from "./FilterItemButton";
import { useCallback, useMemo } from "react";
import Icon from "../../ui/Icon";
import { scrollToNounExplorer } from "@nouns/utils/scroll";

export const BUY_NOW_FILTER_KEY = "buyNow";

export default function BuyNowFilter() {
  const searchParams = useSearchParams();

  const isChecked = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    return params.get(BUY_NOW_FILTER_KEY) === "1";
  }, [searchParams]);

  const handleBuyNowFilterChange = useCallback(
    (checked: boolean) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (!checked) {
        params.delete(BUY_NOW_FILTER_KEY);
      } else {
        params.set(BUY_NOW_FILTER_KEY, "1");
      }

      window.history.pushState(null, "", `?${params.toString()}`);
      scrollToNounExplorer();
    },
    [searchParams]
  );

  return (
    <FilterItemButton isChecked={isChecked} onClick={() => handleBuyNowFilterChange(!isChecked)}>
      <div className="flex items-center gap-2">
        <Icon icon="lightning" size={20} className="fill-content-primary" />
        <h6>Buy Now</h6>
      </div>
    </FilterItemButton>
  );
}
