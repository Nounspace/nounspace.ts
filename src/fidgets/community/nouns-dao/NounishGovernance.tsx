import React, { useEffect, useMemo, useState } from "react";
import { CardContent } from "@/common/components/atoms/card";
import ProposalListView from "@/fidgets/community/nouns-dao/components/ProposalListView";
import BuilderProposalDetailView from "@/fidgets/community/nouns-dao/components/BuilderProposalDetailView";
import NounsProposalDetailView from "@/fidgets/community/nouns-dao/components/NounsProposalDetailView";
import useGraphqlQuery from "@/common/lib/hooks/useGraphqlQuery";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import {
  NOUNSBUILD_PROPOSALS_QUERY,
  NOUNS_PROPOSALS_QUERY,
  NOUNS_PROPOSAL_DETAIL_QUERY,
} from "@/common/lib/utils/queries";
import { FidgetSettingsStyle } from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import { DaoSelector } from "@/common/components/molecules/DaoSelector";
import { NOUNS_DAO } from "@/constants/basedDaos";
import axios from "axios";

export type NounishGovernanceSettings = {
  subgraphUrl: string;
  daoContractAddress: string;
  selectedDao: {
    name: string;
    contract: string;
    graphUrl: string;
    icon: string;
  };
} & FidgetSettingsStyle;

export const nounishGovernanceConfig: FidgetProperties = {
  fidgetName: "Nounish Governance",
  icon: 0x1f3db,
  fields: [
    {
      fieldName: "selectedDao",
      default: {
        name: "Nouns DAO",
        contract: "", // nouns dao does not need a contract address
        graphUrl: NOUNS_DAO,
      },
      required: false,
      inputSelector: DaoSelector,
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
  const [selectedDao, setSelectedDao] = useState(settings.selectedDao);

  useEffect(() => {
    setSelectedDao(settings.selectedDao);
  }, [settings.selectedDao]);

  const isBuilderSubgraph = useMemo(
    () => selectedDao?.graphUrl.includes("nouns-builder-base-mainnet") || false,
    [selectedDao?.graphUrl],
  );

  const daoContractAddress =
    selectedDao?.contract || settings.daoContractAddress;
  const graphUrl =
    selectedDao?.graphUrl || "https://www.nouns.camp/subgraphs/nouns";

  const {
    data: proposalsData,
    loading: listLoading,
    error: listError,
  } = useGraphqlQuery({
    url: graphUrl,
    query: isBuilderSubgraph
      ? NOUNSBUILD_PROPOSALS_QUERY
      : NOUNS_PROPOSALS_QUERY,
    variables: {
      where: isBuilderSubgraph ? { dao: daoContractAddress } : undefined,
    },
  });

  const [currentBlock, setCurrentBlock] = useState<{
    number: number;
    timestamp: number;
  }>({ number: 0, timestamp: 0 });

  useEffect(() => {
    const fetchBlockNumber = async () => {
      try {
        const response = await axios.get(
          "https://pioneers.dev/api/v1/blockHeight/eip155%3A1",
        );
        setCurrentBlock({
          number: Number(response.data.height),
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Error fetching block number:", error);
      }
    };

    fetchBlockNumber();
  }, []);

  if (listError) {
    return <div>Error loading data</div>;
  }

  const handleGoBack = () => {
    setProposalId(null);
  };

  const handleSetProposal = (proposalId: string) => {
    setProposalId(proposalId);
  };

  const selectedProposal = isBuilderSubgraph
    ? proposalsData?.proposals.find(
        (proposal) => proposal.proposalId === proposalId,
      )
    : proposalsData?.proposals.find((proposal) => proposal.id === proposalId);
  return (
    <CardContent className="size-full overflow-scroll p-4">
      {proposalId && selectedProposal ? (
        isBuilderSubgraph ? (
          <BuilderProposalDetailView
            proposal={selectedProposal}
            goBack={handleGoBack}
            currentBlock={currentBlock}
            loading={listLoading}
            versions={[]}
          />
        ) : (
          <NounsProposalDetailView
            proposal={selectedProposal}
            versions={selectedProposal}
            goBack={handleGoBack}
            currentBlock={currentBlock}
            loading={listLoading}
          />
        )
      ) : (
        <ProposalListView
          proposals={proposalsData?.proposals || []}
          currentBlock={currentBlock}
          setProposal={handleSetProposal}
          loading={listLoading}
          isBuilderSubgraph={isBuilderSubgraph}
          title={selectedDao.name}
          daoIcon={selectedDao.icon || "/images/nouns_yellow_logo.jpg"}
        />
      )}
    </CardContent>
  );
};

export default {
  fidget: NounishGovernance,
  properties: nounishGovernanceConfig,
} as FidgetModule<FidgetArgs<NounishGovernanceSettings>>;
