import { BigIntString } from "@nouns/utils/types";
import { Auction } from "./auction/types";
import { Noun, SecondaryNounListing, SecondaryNounOffer } from "./noun/types";
import { Address } from "viem";
import { ProposalVote } from "./ponder/governance/getProposal";
import { safeFetch } from "@nouns/utils/safeFetch";

export function currentAuctionIdQuery() {
  return {
    queryKey: ["current-auction-id"],
    queryFn: async () => await safeFetch<string>("/api/auction/currentId"),
  };
}

export function auctionQuery(id?: BigIntString) {
  return {
    queryKey: ["auction", id],
    queryFn: async () => await safeFetch<Auction>(`/api/auction/${id}`),
  };
}

export function nounQuery(id?: BigIntString) {
  return {
    queryKey: ["noun", id],
    queryFn: async () => await safeFetch<Noun>(`/api/noun/${id}`),
  };
}

export function secondaryFloorListingQuery() {
  return {
    queryKey: ["secondary-floor-listing"],
    queryFn: async () =>
      await safeFetch<SecondaryNounListing>(`/api/secondary-floor-listing`),
  };
}

export function secondaryTopOfferQuery() {
  return {
    queryKey: ["secondary-top-offer"],
    queryFn: async () =>
      await safeFetch<SecondaryNounOffer>(`/api/secondary-top-offer`),
  };
}

export function nogsQuery(nounId: string) {
  return {
    queryKey: ["nogs", nounId],
    queryFn: async () => await safeFetch<number>(`/api/noun/${nounId}/nogs`),
  };
}

export function proposalVotesAfterTimestampQuery(
  proposalId: number,
  timestamp: number,
) {
  return {
    queryKey: ["proposal-votes-after-timestamp", proposalId, timestamp],
    queryFn: async () =>
      await safeFetch<ProposalVote[]>(`/api/votes/${proposalId}/${timestamp}`),
  };
}
