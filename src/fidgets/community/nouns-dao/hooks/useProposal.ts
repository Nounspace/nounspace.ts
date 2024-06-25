import { useState, useEffect } from "react";
import type { ProposalData } from "@/fidgets/community/nouns-dao";

const NOUNS_API_ENDPOINT = "https://api.nouns.biz";

export const useProposalDetail = (
  proposalId: string,
): {
  proposal: ProposalData | null | undefined;
  loading: boolean;
} => {
  // todo: handle errors
  const [proposal, setProposal] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProposal = async () => {
    setLoading(true);

    try {
      const resp = await fetch(`${NOUNS_API_ENDPOINT}/proposal/${proposalId}`);
      const data = await resp.json();
      setProposal(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  return { proposal, loading };
};

export default useProposalDetail;
