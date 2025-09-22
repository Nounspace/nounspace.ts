import { Proposal, ProposalVote } from "@nouns/data/ponder/governance/getProposal";
import { proposalVotesAfterTimestampQuery } from "@nouns/data/tanstackQueries";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface UseAllProposalVotesParams {
  proposal: Proposal;
}

export function useAllProposalVotes({
  proposal,
}: UseAllProposalVotesParams): ProposalVote[] {
  const { data: newVotes, error } = useQuery({
    ...proposalVotesAfterTimestampQuery(
      Number(proposal.id),
      Number(proposal.votes[0]?.timestamp ?? "0"),
    ),
    enabled: proposal.state == "active",
    refetchInterval: 1000 * 3, // Poll every 3s for active proposal votes for realtime updates
  });

  const allVotes = useMemo(() => {
    return [...(newVotes ? newVotes : []), ...proposal.votes];
  }, [newVotes, proposal.votes]);

  return allVotes;
}
