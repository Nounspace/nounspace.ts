import clsx from "clsx";
import AuctionClient from "./AuctionClient";
import { getCurrentAuctionNounId } from "@nouns/data/auction/getCurrentAuctionNounId";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { Suspense } from "react";
import {
  auctionQuery,
  currentAuctionIdQuery,
  nounQuery,
  secondaryFloorListingQuery,
  secondaryTopOfferQuery,
} from "@nouns/data/tanstackQueries";
import { getAuctionById } from "@nouns/data/auction/getAuctionById";
import { getNounByIdUncached } from "@nouns/data/noun/getNounById";
import {
  getSecondaryFloorListing,
  getSecondaryTopOffer,
} from "@nouns/data/noun/getSecondaryNounListings";
import { getClients } from "@nouns/data/ponder/client/getClients";

export default async function Auction({
  initialAuctionId,
}: {
  initialAuctionId?: string;
}) {
  return (
    <div
      className={clsx(
        "relative flex h-full min-h-[593px] w-full flex-col justify-center overflow-hidden rounded-2xl border-2 bg-nouns-cool md:h-[477px] md:min-h-fit md:flex-row md:border-none md:px-4",
      )}
    >
      <Suspense fallback={null}>
        <AuctionWrapper initialAuctionId={initialAuctionId} />
      </Suspense>
    </div>
  );
}

async function AuctionWrapper({
  initialAuctionId,
}: {
  initialAuctionId?: string;
}) {
  const queryClient = new QueryClient();
  const [currentAuctionId, clients] = await Promise.all([
    getCurrentAuctionNounId(),
    getClients(),
  ]);
  const auctionId = initialAuctionId ?? currentAuctionId;

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: currentAuctionIdQuery().queryKey,
      queryFn: getCurrentAuctionNounId,
    }),
    queryClient.prefetchQuery({
      queryKey: auctionQuery(auctionId).queryKey,
      queryFn: async () => await getAuctionById(auctionId),
    }),
    queryClient.prefetchQuery({
      queryKey: nounQuery(auctionId).queryKey,
      queryFn: async () => await getNounByIdUncached(auctionId),
    }),
    queryClient.prefetchQuery({
      queryKey: secondaryFloorListingQuery().queryKey,
      queryFn: async () => await getSecondaryFloorListing(),
    }),
    queryClient.prefetchQuery({
      queryKey: secondaryTopOfferQuery().queryKey,
      queryFn: async () => await getSecondaryTopOffer(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuctionClient clients={clients} />
    </HydrationBoundary>
  );
}
