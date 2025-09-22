"use client";
import { ComponentProps, forwardRef, ReactNode } from "react";
import { TableRow } from "./ui/table";
import { cn } from "@nouns/utils/shadcn";

interface TableLinkRowProps extends ComponentProps<typeof TableRow> {
  href: string;
  children: ReactNode;
}

export const TableLinkExternalRow = forwardRef<
  HTMLTableRowElement,
  TableLinkRowProps
>(({ href, children, className }, ref) => {
  return (
    <TableRow
      ref={ref}
      className={cn("cursor-pointer", className)}
      onClick={() => window.open(href)}
    >
      {children}
    </TableRow>
  );
});
TableLinkExternalRow.displayName = "TableLinkExternalRow";
