import { getAuctionById } from "@nouns/data/auction/getAuctionById";
import { getCurrentAuctionNounId } from "@nouns/data/auction/getCurrentAuctionNounId";
import { getNounByIdUncached } from "@nouns/data/noun/getNounById";
import {
  auctionQuery,
  currentAuctionIdQuery,
  nounQuery,
} from "@nouns/data/tanstackQueries";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ReactNode, Suspense } from "react";

export function CurrentAuctionPrefetchWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <FetchWrapper>{children}</FetchWrapper>
    </Suspense>
  );
}

async function FetchWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  const auctionId = await getCurrentAuctionNounId();

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
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
