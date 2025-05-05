import React, { useEffect, useState } from "react";
import { CardContent } from "@/common/components/atoms/card";
import FontSelector from "@/common/components/molecules/FontSelector";
import {
  FidgetArgs,
  FidgetModule,
  FidgetProperties,
  FidgetSettingsStyle,
} from "@/common/fidgets";
import useGraphqlQuery from "@/common/lib/hooks/useGraphqlQuery";
import { NOUNS_PROPOSALS_QUERY } from "@/common/lib/utils/queries";
import { wagmiConfig } from "@/common/providers/Wagmi";
import { NOUNS_DAO } from "@/constants/basedDaos";
import NounsProposalDetailView from "@/fidgets/community/nouns-dao/components/NounsProposalDetailView";
import { defaultStyleFields } from "@/fidgets/helpers";
import { getBlock } from "wagmi/actions";
import TextInput from "@/common/components/molecules/TextInput";

export type SingleNounsProposalSettings = {
  proposalId: string;
  headingsFontFamily?: string;
  fontFamily?: string;
} & FidgetSettingsStyle;

export const singleNounsProposalConfig: FidgetProperties = {
  fidgetName: "Single Nouns Proposal",
  mobileFidgetName: "Proposal",
  mobileIcon: <span className="text-base">⌐◨-◨</span>,
  icon: 0x1f3db,
  fields: [
    {
      fieldName: "proposalId",
      default: "666",
      required: true,
      inputSelector: TextInput,
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

export const SingleNounsProposal: React.FC<
  FidgetArgs<SingleNounsProposalSettings>
> = ({ settings }) => {
  const { proposalId } = settings;

  const {
    data: proposalsData,
    loading,
    error,
  } = useGraphqlQuery({
    url: NOUNS_DAO,
    query: NOUNS_PROPOSALS_QUERY,
    variables: {},
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

  // Debugging logs in useEffect to ensure they run after data loads
  useEffect(() => {
    console.debug("SingleNounsProposal: proposalId", proposalId);
    console.debug("SingleNounsProposal: proposalsData", proposalsData);
    const selectedProposal = proposalsData?.proposals.find(
      (proposal) => proposal.id === proposalId
    );
    console.debug("SingleNounsProposal: selectedProposal", selectedProposal);
  }, [proposalsData, proposalId]);

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

  if (error) {
    return <div>Error loading proposal data</div>;
  }

  const selectedProposal = proposalsData?.proposals.find(
    (proposal) => proposal.id === proposalId
  );

  if (!selectedProposal && !loading) {
    return <div>Proposal not found</div>;
  }

  return (
    <CardContent
      className="size-full overflow-scroll p-4"
      style={{ fontFamily: getBodyFontFamily() }}
    >
      {selectedProposal ? (
        <NounsProposalDetailView
          proposal={selectedProposal}
          goBack={() => {}}
          currentBlock={currentBlock}
          loading={loading}
          headingsFont={getHeadingsFontFamily()}
          bodyFont={getBodyFontFamily()}
        />
      ) : (
        <div>Loading...</div>
      )}
    </CardContent>
  );
};

export default {
  fidget: SingleNounsProposal,
  properties: singleNounsProposalConfig,
} as FidgetModule<FidgetArgs<SingleNounsProposalSettings>>;
