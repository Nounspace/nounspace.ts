"use client";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import NavButtons from "./NavButtons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  auctionQuery,
  currentAuctionIdQuery,
  nounQuery,
  secondaryFloorListingQuery,
  secondaryTopOfferQuery,
} from "@nouns/data/tanstackQueries";
import { LiveAuction } from "./LiveAuction";
import { EndedAuction } from "./EndedAuction";
import { Client } from "@nouns/data/ponder/client/getClients";
import { NounImageBase } from "../NounImage";

const PREFETCH_DISTANCE = 3;

export default function AuctionClient({ clients }: { clients: Client[] }) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const requestedAuctionId = useMemo(() => {
    return searchParams?.get("auctionId");
  }, [searchParams]);

  const { data: currentAuctionId, refetch: refetchCurrentAuctionId } = useQuery(
    {
      ...currentAuctionIdQuery(),
    },
  );

  const { data: secondaryFloorListing } = useQuery({
    ...secondaryFloorListingQuery(),
  });

  const { data: secondaryTopOffer } = useQuery({
    ...secondaryTopOfferQuery(),
  });

  const auctionId = useMemo(() => {
    return requestedAuctionId ?? currentAuctionId ?? undefined;
  }, [requestedAuctionId, currentAuctionId]);

  const { data: auction } = useQuery({
    ...auctionQuery(auctionId),
    enabled: !!auctionId,
    refetchInterval: auctionId == currentAuctionId ? 1000 : undefined, // 1 sec
  });

  const { data: noun } = useQuery({
    ...nounQuery(auctionId),
    enabled: !!auctionId,
  });

  const date = useMemo(() => {
    if (auction?.endTime) {
      const endTimeMs = Number(auction.endTime) * 1000;
      const endDate = new Date(endTimeMs);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(endDate);
    } else {
      return null;
    }
  }, [auction?.endTime]);

  // Update current auction once it settles
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (auctionId == currentAuctionId) {
      interval = setInterval(() => {
        if (
          auction?.state == "ended-settled" &&
          auctionId == currentAuctionId
        ) {
          refetchCurrentAuctionId();
        }
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [auctionId, currentAuctionId, auction?.state, refetchCurrentAuctionId]);

  // Set to current if at or above current
  useEffect(() => {
    if (
      requestedAuctionId &&
      currentAuctionId &&
      Number(requestedAuctionId) >= Number(currentAuctionId)
    ) {
      const params = new URLSearchParams(searchParams);
      params.delete("auctionId");
      window.history.pushState(null, "", `?${params.toString()}`);
    }
  }, [requestedAuctionId, currentAuctionId, searchParams]);

  // Prefetch auctions on either side
  useEffect(() => {
    async function prefetch() {
      if (auctionId && currentAuctionId) {
        const id = Number(auctionId);
        for (
          let i = Math.max(0, id - PREFETCH_DISTANCE);
          i < Math.min(Number(currentAuctionId), id + PREFETCH_DISTANCE);
          i++
        ) {
          await Promise.all([
            queryClient.prefetchQuery(auctionQuery(i.toString())),
            queryClient.prefetchQuery(nounQuery(i.toString())),
          ]);
        }
      }
    }

    prefetch();
  }, [auctionId, currentAuctionId, queryClient]);

  return (
    <>
      <div
        className={clsx(
          "absolute inset-0 z-0",
          noun?.traits.background.seed == 1 ? "bg-nouns-warm" : "bg-nouns-cool",
        )}
      />
      <div
        className={clsx(
          "flex flex-col items-center justify-end gap-0 md:flex-1 md:items-end md:bg-transparent md:pr-[60px]",
        )}
      >
        <NounImageBase
          noun={noun ?? undefined}
          width={370}
          height={370}
          priority
          className="z-10 flex h-[194px] w-[194px] flex-1 grow-0 select-none items-end justify-end rounded-3xl object-contain object-bottom md:h-[470px] md:w-[470px]"
        />
      </div>
      <div className="z-10 flex min-h-[389px] w-full min-w-0 flex-1 flex-col items-start justify-start gap-4 bg-white p-6 md:min-h-[477px] md:w-fit md:gap-6 md:bg-transparent">
        <div className="flex w-full flex-col gap-2 md:pt-[44px]">
          <div className="flex w-full flex-row-reverse items-center justify-between gap-3 md:flex-row md:justify-start">
            {auctionId && currentAuctionId && (
              <NavButtons
                auctionId={auctionId}
                currentAuctionId={currentAuctionId}
              />
            )}
            <span className="text-content-secondary label-md">{date}</span>
          </div>
          <div className="flex whitespace-pre-wrap heading-1">
            Noun {auctionId}
          </div>
        </div>

        {auction &&
          (auction.state == "live" ? (
            <LiveAuction
              auction={auction}
              secondaryFloorListing={secondaryFloorListing ?? null}
              secondaryTopOffer={secondaryTopOffer ?? null}
              clients={clients}
            />
          ) : (
            <EndedAuction auction={auction} clients={clients} />
          ))}
      </div>
    </>
  );
}
