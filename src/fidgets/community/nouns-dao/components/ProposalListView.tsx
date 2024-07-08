import React from "react";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/atoms/card";
import BuilderProposalItem from "./BuilderProposalItem";
import ProposalListRowItem from "./ProposalListRowItem";

const ProposalListView = ({
  proposals,
  setProposal,
  currentBlock,
  loading,
  isBuilderSubgraph,
}: {
  proposals: any[];
  setProposal: (proposalId: string, proposal: any) => void; // Update the type here
  currentBlock: any;
  loading: boolean;
  isBuilderSubgraph: boolean;
}) => {
  if (loading) {
    return <div>Fetching data...</div>;
  }

  return (
    <>
      <CardHeader className="px-0 pt-2 pb-4">
        <CardDescription className="font-semibold text-sm/[1.0]">
          {isBuilderSubgraph ? "Builder DAO" : "Nouns DAO"}
        </CardDescription>
        <CardTitle className="text-xl">Proposals</CardTitle>
      </CardHeader>
      <div className="grid gap-2">
        {proposals.map((proposal, i) =>
          isBuilderSubgraph ? (
            <BuilderProposalItem
              key={i}
              proposal={proposal}
              setProposal={setProposal}
            />
          ) : (
            <ProposalListRowItem
              key={i}
              proposal={proposal}
              setProposal={setProposal}
              currentBlock={currentBlock}
            />
          ),
        )}
      </div>
    </>
  );
};

export default ProposalListView;
