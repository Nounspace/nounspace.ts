"use client";
import { Client } from "@nouns/data/ponder/client/getClients";
import {
  ColumnDef,
  SortingState,
  getSortedRowModel,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nouns/components/ui/table";
import { useState } from "react";
import SortIcon from "@nouns/components/SortIcon";
import { formatNumber } from "@nouns/utils/format";
import Image from "next/image";
import { LinkExternal } from "@nouns/components/ui/link";

interface ClientStatsProps {
  clients: Client[];
}

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const client = row.original;

      return (
        // Just for SEO, since we make the whole row clickable
        <LinkExternal
          className="flex items-center gap-2 hover:brightness-100"
          href={client.url ?? ""}
          includeReferrer
        >
          {client.icon && (
            <Image
              src={client.icon}
              width={20}
              height={20}
              alt=""
              className="min-h-[20px] min-w-[20px] rounded-full"
            />
          )}
          <span className="max-w-[100px] overflow-hidden truncate md:max-w-[190px]">
            {client.name}
          </span>
        </LinkExternal>
      );
    },
  },
  {
    accessorKey: "auctionsWon",
    header: "Auctions",
  },
  {
    accessorKey: "proposalsCreated",
    header: "Proposals",
  },
  {
    accessorKey: "votesCast",
    header: "Votes",
  },
  {
    accessorKey: "rewardAmountEth",
    header: "Rewards",
    cell: ({ row }) =>
      formatNumber({ input: row.original.rewardAmountEth, unit: "Ξ" }),
  },
];

export default function ClientStats({ clients }: ClientStatsProps) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "rewardAmountEth",
      desc: true,
    },
  ]);

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-background-primary"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    <button onClick={() => header.column.toggleSorting()}>
                      <div className="flex">
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </div>
                        )}
                        <SortIcon
                          state={header.column.getIsSorted() ?? false}
                        />
                      </div>
                    </button>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:cursor-pointer"
                onClick={() => {
                  row.original.url
                    ? window.open(row.original.url, "_blank")
                    : {};
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
