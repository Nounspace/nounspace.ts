import React, { useEffect, useMemo, useState } from "react";
import { CardContent } from "@/common/components/atoms/card";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import useGraphqlQuery from "@/common/lib/hooks/useGraphqlQuery";
import {
  NOUNSBUILD_PROPOSALS_QUERY,
  NOUNS_PROPOSALS_QUERY,
  NOUNS_PROPOSAL_DETAIL_QUERY,
} from "@/common/lib/utils/queries";
import ProposalDetailView from "@/fidgets/community/nouns-dao/components/ProposalDetailView";
import ProposalListView from "@/fidgets/community/nouns-dao/components/ProposalListView";
import { defaultStyleFields } from "@/fidgets/helpers";

export type NounishGovernanceSettings = {
  subgraphUrl: string;
  daoContractAddress: string;
} & FidgetSettingsStyle;

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
    {
      fieldName: "daoContractAddress",
      default: "Only for Builder Daos",
      required: true,
      inputSelector: TextInput,
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

export const NounishGovernance: React.FC<
  FidgetArgs<NounishGovernanceSettings>
> = ({ settings }) => {
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [proposalVersions, setProposalVersions] = useState<any[]>([]);
  const [proposalLoading, setProposalLoading] = useState<boolean>(false);

  const isBuilderSubgraph = useMemo(
    () => settings.subgraphUrl.includes("nouns-builder-base-mainnet"),
    [settings.subgraphUrl],
  );

  const daoContractAddress = settings.daoContractAddress;

  const {
    data: proposalsData,
    loading: listLoading,
    error: listError,
  } = useGraphqlQuery({
    url: settings.subgraphUrl,
    query: isBuilderSubgraph
      ? NOUNSBUILD_PROPOSALS_QUERY
      : NOUNS_PROPOSALS_QUERY,
    variables: {
      where: isBuilderSubgraph ? { dao: daoContractAddress } : undefined,
    },
  });

  const {
    data: proposalDetailData,
    loading: detailLoading,
    error: detailError,
  } = useGraphqlQuery({
    url: settings.subgraphUrl,
    query: NOUNS_PROPOSAL_DETAIL_QUERY,
    skip: !proposalId || isBuilderSubgraph,
    variables: {
      id: proposalId,
    },
  });

  useEffect(() => {
    if (proposalsData) {
      setProposals(proposalsData.proposals || []);
    }
  }, [proposalsData]);

  useEffect(() => {
    if (proposalDetailData) {
      setSelectedProposal(proposalDetailData.proposal || null);
      setProposalVersions(proposalDetailData.proposalVersions || []);
      setProposalLoading(detailLoading);
    }
  }, [proposalDetailData, detailLoading]);

  const currentBlock = proposalsData?._meta?.block;

  if (listError || detailError) {
    return <div>Error loading data</div>;
  }

  const handleGoBack = () => {
    setProposalId(null);
    setSelectedProposal(null);
    setProposalLoading(false);
  };

  return (
    <CardContent className="size-full overflow-scroll p-4">
      {selectedProposal && !isBuilderSubgraph ? (
        <ProposalDetailView
          proposal={selectedProposal}
          versions={proposalVersions}
          currentBlock={currentBlock}
          goBack={handleGoBack}
          loading={proposalLoading}
        />
      ) : (
        <ProposalListView
          proposals={proposals}
          currentBlock={currentBlock}
          setProposal={setProposalId}
          loading={listLoading}
          isBuilderSubgraph={isBuilderSubgraph}
          selectedProposal={selectedProposal}
          goBack={handleGoBack}
          proposalLoading={proposalLoading}
        />
      )}
    </CardContent>
  );
};

export default {
  fidget: NounishGovernance,
  properties: nounishGovernanceConfig,
} as FidgetModule<FidgetArgs<NounishGovernanceSettings>>;
