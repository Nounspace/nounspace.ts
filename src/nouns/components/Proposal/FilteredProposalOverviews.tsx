"use client";
import { ProposalOverview } from "@nouns/data/ponder/governance/common";
import { useSearchContext } from "../Search";
import { NoProposals, ProposalOverviewCard } from "./ProposalOverviewCard";

export default function FilteredProposalOverviews({
  type,
  overviews,
}: {
  type: string;
  overviews: ProposalOverview[];
}) {
  const { debouncedSearchValue } = useSearchContext();

  const filteredOverviews = overviews.filter((overview) => {
    return (
      overview.title
        .toLowerCase()
        .includes(debouncedSearchValue.toLowerCase()) ||
      overview.proposerAddress
        .toLowerCase()
        .includes(debouncedSearchValue.toLowerCase())
    );
  });

  return (
    <>
      {filteredOverviews.length > 0 ? (
        filteredOverviews.map((p, i) => (
          <ProposalOverviewCard key={i} proposalOverview={p} />
        ))
      ) : (
        <NoProposals
          type={type}
          searchFilterActive={debouncedSearchValue != ""}
        />
      )}
    </>
  );
}
