"use client";
import { CHAIN_CONFIG } from "@nouns/config";
import { formatNumber } from "@nouns/utils/format";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Address } from "viem";
import { TableCell } from "@nouns/components/ui/table";
import { TableLinkExternalRow } from "@nouns/components/TableLinkExternalRow";
import Identity from "@nouns/components/Identity";
import { Skeleton } from "@nouns/components/ui/skeleton";

export function LeaderboardStatsRow({
  address,
  ownershipCount,
  percentOwnership,
  position,
}: {
  address: Address;
  ownershipCount: number;
  percentOwnership: number;
  position: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "500px 0px" });

  return (
    <TableLinkExternalRow
      key={address}
      href={
        CHAIN_CONFIG.chain.blockExplorers?.default.url + `/address/${address}`
      }
      ref={ref}
    >
      <TableCell className="label-sm">{position}</TableCell>
      <TableCell className="label-md">
        {isInView ? (
          <Identity address={address} avatarSize={32} className="gap-2" />
        ) : (
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
        )}
      </TableCell>
      <TableCell className="w-[130px] text-right label-md">
        <div className="flex items-center justify-end gap-2">
          <span className="text-content-secondary paragraph-sm">
            ({formatNumber({ input: percentOwnership, percent: true })})
          </span>
          <span>
            {formatNumber({
              input: ownershipCount,
              maxFractionDigits: 2,
            })}
          </span>
        </div>
      </TableCell>
    </TableLinkExternalRow>
  );
}
