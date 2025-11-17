import React from "react";
import { PAGE_SIZE } from "../constants";

export type PaginationControlsProps = {
  currentPage: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  totalCount: number;
};

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  pageCount,
  onPrev,
  onNext,
  totalCount,
}) => {
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(totalCount, currentPage * PAGE_SIZE);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground">
        Showing {totalCount === 0 ? 0 : start}-{end} of {totalCount}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="rounded-full border border-black/10 px-2 py-1 text-xs font-semibold text-foreground disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-[11px] text-muted-foreground">
          Page {currentPage} / {pageCount}
        </span>
        <button
          type="button"
          aria-label="Next page"
          onClick={onNext}
          disabled={currentPage >= pageCount}
          className="rounded-full border border-black/10 px-2 py-1 text-xs font-semibold text-foreground disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

