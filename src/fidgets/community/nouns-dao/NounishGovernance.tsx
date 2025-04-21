import { CardContent } from "@/common/components/atoms/card";
import { DaoSelector } from "@/common/components/molecules/DaoSelector";
import FontSelector from "@/common/components/molecules/FontSelector";
import { FidgetArgs, FidgetModule, FidgetProperties, FidgetSettingsStyle } from "@/common/fidgets";
import useGraphqlQuery from "@/common/lib/hooks/useGraphqlQuery";
import {
  NOUNSBUILD_PROPOSALS_QUERY,
  NOUNS_PROPOSALS_QUERY,
} from "@/common/lib/utils/queries";
import { wagmiConfig } from "@/common/providers/Wagmi";
import { NOUNS_DAO } from "@/constants/basedDaos";
import BuilderProposalDetailView from "@/fidgets/community/nouns-dao/components/BuilderProposalDetailView";
import NounsProposalDetailView from "@/fidgets/community/nouns-dao/components/NounsProposalDetailView";
import ProposalListView from "@/fidgets/community/nouns-dao/components/ProposalListView";
import { defaultStyleFields } from "@/fidgets/helpers";
import React, { useEffect, useMemo, useState } from "react";
import { getBlock } from "wagmi/actions";

export type NounishGovernanceSettings = {
  subgraphUrl: string;
  daoContractAddress: string;
  selectedDao: {
    name: string;
    contract: string;
    graphUrl: string;
    icon: string;
  };
  headingsFontFamily?: string;
  fontFamily?: string;
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
    {
      fieldName: "headingsFontFamily",
      default: "Theme Headings Font",
      required: false,
      inputSelector: FontSelector,
      group: "style",
    },
    {
      fieldName: "fontFamily",
      default: "Theme Font",
      required: false,
      inputSelector: FontSelector,
      group: "style",
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
        const block = await getBlock(wagmiConfig);
        setCurrentBlock({
          number: Number(block.number),
          timestamp: Number(block.timestamp) * 1000,
        });
      } catch (error) {
        console.error("Error fetching block number:", error);
      }
    };

    fetchBlockNumber();
  }, []);

  const getHeadingsFontFamily = () => {
    return settings.headingsFontFamily === "Theme Headings Font" 
      ? "var(--user-theme-headings-font)" 
      : settings.headingsFontFamily || "var(--user-theme-headings-font)";
  };

  const getBodyFontFamily = () => {
    return settings.fontFamily === "Theme Font" 
      ? "var(--user-theme-font)" 
      : settings.fontFamily || "var(--user-theme-font)";
  };

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
    <CardContent className="size-full overflow-scroll p-4" style={{ fontFamily: getBodyFontFamily() }}>
      {proposalId && selectedProposal ? (
        isBuilderSubgraph ? (
          <BuilderProposalDetailView
            proposal={selectedProposal}
            goBack={handleGoBack}
            currentBlock={currentBlock}
            loading={listLoading}
            versions={[]}
            headingsFont={getHeadingsFontFamily()}
            bodyFont={getBodyFontFamily()}
          />
        ) : (
          <NounsProposalDetailView
            proposal={selectedProposal}
            versions={selectedProposal}
            goBack={handleGoBack}
            currentBlock={currentBlock}
            loading={listLoading}
            headingsFont={getHeadingsFontFamily()}
            bodyFont={getBodyFontFamily()}
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
          headingsFont={getHeadingsFontFamily()}
          bodyFont={getBodyFontFamily()}
        />
      )}
    </CardContent>
  );
};

export default {
  fidget: NounishGovernance,
  properties: nounishGovernanceConfig,
} as FidgetModule<FidgetArgs<NounishGovernanceSettings>>;
