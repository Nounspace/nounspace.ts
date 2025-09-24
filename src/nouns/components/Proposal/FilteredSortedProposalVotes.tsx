"use client";
import { useSearchContext } from "../Search";
import ProposalVote from "./ProposalVote";
import { useSortContext } from "../Sort";
import { useMemo } from "react";
import { useAllProposalVotes } from "@nouns/hooks/useAllProposalVotes";
import { Proposal } from "@nouns/data/ponder/governance/getProposal";

export const VOTE_SORT_ITEMS: { name: string; value: string }[] = [
  { name: "Most recent", value: "recent" },
  { name: "Vote weight", value: "weight" },
];

export default function FilteredSortedProposalVotes({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { debouncedSearchValue } = useSearchContext();
  const { sortValue } = useSortContext();

  // Get realtime new votes too
  const allProposalVotes = useAllProposalVotes({ proposal });

  const filteredSortedVotes = useMemo(() => {
    const filteredSortedVotes = [...allProposalVotes].filter((vote) => {
      return (
        (vote.reason ?? "")
          .toLowerCase()
          .includes(debouncedSearchValue.toLowerCase()) ||
        vote.voter
          .toLowerCase()
          .includes(debouncedSearchValue.toLowerCase())
      );
    });
    filteredSortedVotes.sort((a, b) =>
      sortValue == "weight"
        ? Number(b.votes) - Number(a.votes)
        : Number(b.blockTimestamp) - Number(a.blockTimestamp),
    );

    return filteredSortedVotes;
  }, [allProposalVotes, sortValue, debouncedSearchValue]);

  return (
    <>
      {filteredSortedVotes.length > 0 ? (
        filteredSortedVotes.map((vote, i) => (
          <ProposalVote key={i} vote={vote} proposalState={proposal.state} />
        ))
      ) : (
        <div className="flex h-[120px] w-full items-center justify-center rounded-[12px] border bg-gray-100 px-6 py-4 text-center">
          There are no votes
          {debouncedSearchValue == "" ? " yet" : " matching the search filter"}.
        </div>
      )}
    </>
  );
}
