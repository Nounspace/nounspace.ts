import React from "react";
import SettingsSelector from "@/common/components/molecules/SettingsSelector";
import { PaginationControls } from "./PaginationControls";
import { LAYOUT_OPTIONS, SORT_OPTIONS } from "../constants";
import type {
  DirectorySource,
  DirectorySortOption,
  DirectoryLayoutStyle,
} from "../types";

export type DirectoryControlsProps = {
  source: DirectorySource;
  currentLayout: DirectoryLayoutStyle;
  currentSort: DirectorySortOption;
  currentPage: number;
  pageCount: number;
  totalCount: number;
  onLayoutChange: (layout: DirectoryLayoutStyle) => void;
  onSortChange: (sort: DirectorySortOption) => void;
  onPagePrev: () => void;
  onPageNext: () => void;
};

export const DirectoryControls: React.FC<DirectoryControlsProps> = ({
  source,
  currentLayout,
  currentSort,
  currentPage,
  pageCount,
  totalCount,
  onLayoutChange,
  onSortChange,
  onPagePrev,
  onPageNext,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="uppercase tracking-wide text-muted-foreground">Style</span>
        <SettingsSelector
          onChange={(value) => onLayoutChange(value as DirectoryLayoutStyle)}
          value={currentLayout}
          settings={LAYOUT_OPTIONS as unknown as { name: string; value: string }[]}
        />
      </div>
      {source === "tokenHolders" && (
        <>
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wide text-muted-foreground">Sort by</span>
            <SettingsSelector
              onChange={(value) => onSortChange(value as DirectorySortOption)}
              value={currentSort}
              settings={SORT_OPTIONS as unknown as { name: string; value: string }[]}
            />
          </div>
        </>
      )}
      <div className="ml-auto flex items-center gap-2">
        <PaginationControls
          currentPage={currentPage}
          pageCount={pageCount}
          onPrev={onPagePrev}
          onNext={onPageNext}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
};

