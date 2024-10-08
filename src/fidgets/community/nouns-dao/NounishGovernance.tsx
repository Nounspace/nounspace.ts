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
        contract: "", // nouns dao does not have a contract address
        graphUrl: NOUNS_DAO,
      }, // Updated default value
      required: false,
      inputSelector: DaoSelector,
    },
    // {
    //   fieldName: "customSubgraphUrl",
    //   default: "",
    //   required: true,
    //   inputSelector: TextInput,
    // },
    // {
    //   fieldName: "customDaoContractAddress",
    //   default: "",
    //   required: true,
    //   inputSelector: TextInput,
    // },
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
  const [selectedDao, setSelectedDao] = useState<{
    name: string;
    contract: string;
    graphUrl: string;
    icon: string;
  }>(settings.selectedDao);

  useEffect(() => {
    setSelectedDao(settings.selectedDao);
  }, [settings.selectedDao]);

  const isBuilderSubgraph = useMemo(
    () => selectedDao?.graphUrl.includes("nouns-builder-base-mainnet") || false,
    [selectedDao?.graphUrl],
  );

  const daoContractAddress =
    selectedDao?.contract || settings.daoContractAddress;
  const graphUrl = selectedDao?.graphUrl || settings.subgraphUrl;

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

  const {
    data: proposalDetailData,
    loading: detailLoading,
    error: detailError,
  } = useGraphqlQuery({
    url: graphUrl,
    query: NOUNS_PROPOSAL_DETAIL_QUERY,
    skip: !proposalId || isBuilderSubgraph,
    variables: { id: proposalId },
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
    setProposalVersions([]);
    setProposalLoading(false);
  };

  const handleSetProposal = (proposalId: string, proposal: any) => {
    setProposalId(proposalId);
    setSelectedProposal(proposal);
    setProposalVersions([]);
  };

  return (
    <CardContent className="size-full overflow-scroll p-4">
      {selectedProposal ? (
        isBuilderSubgraph ? (
          <BuilderProposalDetailView
            proposal={selectedProposal}
            goBack={handleGoBack}
            currentBlock={currentBlock}
            loading={proposalLoading}
            versions={proposalVersions}
          />
        ) : (
          <NounsProposalDetailView
            proposal={selectedProposal}
            versions={proposalVersions}
            goBack={handleGoBack}
            currentBlock={currentBlock}
            loading={proposalLoading}
          />
        )
      ) : (
        <ProposalListView
          proposals={proposals}
          currentBlock={currentBlock}
          setProposal={handleSetProposal}
          loading={listLoading}
          isBuilderSubgraph={isBuilderSubgraph}
          title={isBuilderSubgraph ? selectedDao.name : "Nouns DAO"}
          daoIcon={selectedDao.icon || "images/nounspace_logo.png"}
        />
      )}
    </CardContent>
  );
};

export default {
  fidget: NounishGovernance,
  properties: nounishGovernanceConfig,
} as FidgetModule<FidgetArgs<NounishGovernanceSettings>>;
