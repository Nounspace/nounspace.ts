// src/hooks/useSnapshotProposals.ts

import { useState, useEffect } from "react";

interface FetchProposalsParams {
  ens: string;
  skip: number;
  first: number;
}

const proposalsQuery = (ens: string, skip: number, first: number) => `
    {
        proposals (
            first: ${first},
            skip: ${skip},
            where: {
                space_in: ["${ens}"],
            },
            orderBy: "created",
            orderDirection: desc
        ) {
            id
            title
            body
            choices
            start
            end
            snapshot
            state
            author
            created 
            scores
            scores_total
            space {
                id
                name
            }
            type
        }
    }
`;

export const useSnapshotProposals = ({
  ens,
  skip,
  first,
}: FetchProposalsParams) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch("https://hub.snapshot.org/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: proposalsQuery(ens, skip, first) }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.errors) {
            setError("GraphQL Proposals Error");
            console.error("GraphQL Proposals Error:", data.errors);
            return;
          }
          setProposals(data.data.proposals);
        }
      } catch (error) {
        setError("GraphQL Proposals Error");
        console.error("GraphQL Proposals Error:", error);
      }
    };

    fetchProposals();
  }, [ens, skip, first]);

  return { proposals, error };
};
