import React from "react";
import { CardHeader, CardTitle } from "@/common/components/atoms/card";
import BuilderProposalItem from "./BuilderProposalItem";
import ProposalListRowItem from "./ProposalListRowItem";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/atoms/avatar";
import { FidgetSpinner } from "react-loader-spinner";

const ProposalListView = ({
  proposals,
  setProposal,
  currentBlock,
  loading,
  isBuilderSubgraph,
  title,
  daoIcon,
}: {
  proposals: any[];
  setProposal: (proposalId: string) => void;
  currentBlock: { number: number; timestamp: number };
  loading: boolean;
  isBuilderSubgraph: boolean;
  title: string;
  daoIcon: string;
}) => {
  if (loading) {
    return (
      <center className="align-middle">
        <div className="m-5">
          <FidgetSpinner />
        </div>
      </center>
    );
  }

  return (
    <>
      <CardHeader className="px-0 pt-2 pb-4">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={daoIcon} alt={title} />
            <AvatarFallback>
              <AvatarImage
                src={"public/nouns_yellow_logo.jpg"}
                alt="DAO Icon"
              />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl ml-3">{title}</CardTitle>
        </div>
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
