/* eslint-disable react/react-in-jsx-scope */
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/atoms/avatar";
import { CardHeader, CardTitle } from "@/common/components/atoms/card";
import { FidgetSpinner } from "react-loader-spinner";
import BuilderProposalItem from "./BuilderProposalItem";
import ProposalListRowItem from "./ProposalListRowItem";

const ProposalListView = ({
  proposals,
  setProposal,
  currentBlock,
  loading,
  isBuilderSubgraph,
  title,
  daoIcon,
  headingsFont,
  bodyFont,
}: {
  proposals: any[];
  setProposal: (proposalId: string) => void;
  currentBlock: { number: number; timestamp: number };
  loading: boolean;
  isBuilderSubgraph: boolean;
  title: string;
  daoIcon: string;
  headingsFont?: string;
  bodyFont?: string;
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
              <AvatarImage src={"/nouns_yellow_logo.jpg"} alt="DAO Icon" />
            </AvatarFallback>
          </Avatar>
          <CardTitle
            className="text-xl ml-3"
            style={{ fontFamily: headingsFont }}
          >
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <div className="grid gap-2" style={{ fontFamily: bodyFont }}>
        {proposals.map((proposal, i) =>
          isBuilderSubgraph ? (
            <BuilderProposalItem
              key={i}
              proposal={proposal}
              setProposal={setProposal}
              headingsFont={headingsFont}
              bodyFont={bodyFont}
            />
          ) : (
            <ProposalListRowItem
              key={i}
              proposal={proposal}
              setProposal={setProposal}
              currentBlock={currentBlock}
              headingsFont={headingsFont}
              bodyFont={bodyFont}
            />
          )
        )}
      </div>
    </>
  );
};

export default ProposalListView;
