import React from "react";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/atoms/card";
import BuilderProposalItem from "./BuilderProposalItem";
import ProposalListRowItem from "./ProposalListRowItem";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/atoms/avatar";

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
  setProposal: (proposalId: string, proposal: any) => void;
  currentBlock: any;
  loading: boolean;
  isBuilderSubgraph: boolean;
  title: string;
  daoIcon: string;
}) => {
  if (loading) {
    return (
      <center className="align-middle">
        <div className="m-5">
          <img
            src="/images/tom_alerts.png"
            alt="Loading..."
            style={{
              animation: "spin 2s linear infinite",
              width: "64px",
              marginTop: "50px",
            }}
          />
        </div>
        <p> Tom is thinking...</p>
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
