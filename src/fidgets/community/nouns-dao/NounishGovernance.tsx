import React, { useState } from "react";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";
import type { ProposalData } from "@/fidgets/community/nouns-dao";
import useGraphqlQuery from "@/common/lib/hooks/useGraphqlQuery";
import ProposalListView from "@/fidgets/community/nouns-dao/components/ProposalListView";
import ProposalDetailView from "@/fidgets/community/nouns-dao/components/ProposalDetailView";
import { CardContent } from "@/common/components/atoms/card";
import TextInput from "@/common/components/molecules/TextInput";

export type NounishGovernanceSettings = {
  subgraphUrl: string;
};

export const nounishGovernanceConfig: FidgetProperties = {
  fidgetName: "governance",
  icon: 0x1f3db,
  fields: [
    {
      fieldName: "subgraphUrl",
      default:
        "https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn",
      required: true,
      inputSelector: TextInput,
    },
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const PROPOSALS_QUERY = `
  query ProposalsQuery {
    _meta {
      block {
        number
        timestamp
      }
    }
    proposals(orderBy: startBlock, orderDirection: desc) {
      id
      title
      status
      startBlock
      endBlock
    }
  }
`;

const PROPOSAL_DETAIL_QUERY = `
  query ProposalDetailQuery($id: ID = "") {
    _meta {
      block {
        number
        timestamp
      }
    }
    proposal(id: $id) {
      id
      title
      status
      startBlock
      endBlock
      forVotes
      againstVotes
      abstainVotes
      quorumVotes
      createdTimestamp
      voteSnapshotBlock
      proposer {
        id
        nounsRepresented {
          id
        }
      }
      signers {
        id
        nounsRepresented {
          id
        }
      }
    }
    proposalVersions(
      where: {proposal_: {id: $id}}
      orderBy: createdAt
      orderDirection: desc
    ) {
      createdAt
    }
  }
`;

export const NounishGovernance: React.FC<
  FidgetArgs<NounishGovernanceSettings>
> = ({ settings }) => {
  const [proposalId, setProposalId] = useState<ProposalData | null>(null);
  const { data: proposalsData, loading: listLoading } = useGraphqlQuery({
    url: settings.subgraphUrl,
    query: PROPOSALS_QUERY,
  });
  const { data: proposalDetailData, loading: detailLoading } = useGraphqlQuery({
    url: settings.subgraphUrl,
    query: PROPOSAL_DETAIL_QUERY,
    skip: !proposalId,
    variables: {
      id: proposalId,
    },
  });

  const currentBlock = proposalsData?._meta?.block;
  const proposals = proposalsData?.proposals;
  const proposal = proposalDetailData?.proposal;
  const proposalVersions = proposalDetailData?.proposalVersions;

  return (
    <CardContent className="size-full overflow-scroll p-4">
      {proposalId ? (
        <ProposalDetailView
          proposal={proposal}
          versions={proposalVersions}
          currentBlock={currentBlock}
          goBack={() => setProposalId(null)}
          loading={detailLoading}
        />
      ) : (
        <ProposalListView
          proposals={proposals || []}
          currentBlock={currentBlock}
          setProposal={setProposalId}
          loading={listLoading}
        />
      )}
    </CardContent>
  );
};

export default {
  fidget: NounishGovernance,
  properties: nounishGovernanceConfig,
} as FidgetModule<FidgetArgs<NounishGovernanceSettings>>;
