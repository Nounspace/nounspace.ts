import { useState, useEffect } from "react";
import type { ProposalData } from "@/fidgets/community/nouns-dao";

const NOUNS_API_ENDPOINT = "https://api.nouns.biz";

export const useProposals = (): {
  proposals: ProposalData[] | null | undefined;
  loading: boolean;
} => {
  // todo: handle errors
  const [proposals, setProposals] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProposals = async () => {
    setLoading(true);

    try {
      const resp = await fetch(`${NOUNS_API_ENDPOINT}/proposal/all`);
      const data = await resp.json();
      const desc = data.reverse();
      setProposals(desc);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return { proposals, loading };
};

export default useProposals;
