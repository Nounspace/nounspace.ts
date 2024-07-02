import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/atoms/card";
import BuilderProposalDetailView from "./BuilderProposalDetailView";
import ProposalDetailView from "./ProposalDetailView";
import BuilderProposalItem from "./BuilderProposalItem";
import ProposalListRowItem from "./ProposalListRowItem";
import React from "react";
export const ProposalListView = ({
  proposals,
  setProposal,
  currentBlock,
  loading,
  isBuilderSubgraph,
  selectedProposal,
  goBack,
  proposalLoading,
}: {
  proposals: any[];
  setProposal: (proposalId: string) => void;
  currentBlock: any;
  loading: boolean;
  isBuilderSubgraph: boolean;
  selectedProposal: any;
  goBack: () => void;
  proposalLoading: boolean;
}) => {
  if (loading) {
    return <div>Fetching data...</div>;
  }

  if (selectedProposal) {
    return isBuilderSubgraph ? (
      <BuilderProposalDetailView
        proposal={selectedProposal}
        goBack={goBack}
        loading={proposalLoading}
      />
    ) : (
      <ProposalDetailView
        proposal={selectedProposal}
        versions={[]}
        goBack={goBack}
        currentBlock={currentBlock}
        loading={proposalLoading}
      />
    );
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
