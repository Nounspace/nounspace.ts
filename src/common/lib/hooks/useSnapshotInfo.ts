// src/hooks/useSnapshotProposals.ts

import { useState, useEffect } from "react";

interface FetchSpaceParams {
  ens: string;
}

const spaceQuery = (ens: string) => `
query Spaces {
  spaces(
    where: { id: "${ens}" }
  ) {
    id
    name
    about
    network
    symbol
    strategies {
      name
      network
      params
    }
    admins
    moderators
    members
    filters {
      minScore
      onlyMembers
    }
    plugins
    voting {
      delay
      period
      type
      quorum
      blind
      hideAbstain
      privacy
    }
    validation {
      name
      params
    }
  }
}
`;

export const useSnapShotInfo = ({ ens }: FetchSpaceParams) => {
  const [snapShotInfo, setSnapShotInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch("https://hub.snapshot.org/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: spaceQuery(ens) }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.errors) {
            setError("GraphQL Proposals Error");
            console.error("GraphQL Proposals Error:", data.errors);
            return;
          }
          setSnapShotInfo(data.data);
        }
      } catch (error) {
        setError("GraphQL Proposals Error");
        console.error("GraphQL Proposals Error:", error);
      }
    };

    fetchProposals();
  }, [ens]);

  return { snapShotInfo, error };
};
