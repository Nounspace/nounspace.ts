import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";
import { Address } from "viem";

export const createInitialProposalSpaceConfigForProposalId = (
  proposalId: string,
  proposerAddress: Address,
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.tabNames = ["Proposal"];

  config.fidgetInstanceDatums = {
    "iframe:gnars-proposal": {
      config: {
        editable: true,
        data: {},
        settings: {
          url: `https://nouns.center/dao/gnars/proposal/${proposalId}`,
          showOnMobile: true,
          customMobileDisplayName: "Proposal",
          background: "var(--user-theme-fidget-background)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "iframe",
      id: "iframe:gnars-proposal",
    },
    "text:gnars-proposal-info": {
      config: {
        editable: false,
        data: {},
        settings: {
          content: `Proposal ${proposalId} submitted by ${proposerAddress}. Review discussion threads, Snapshot drafts, and relevant sponsor clips before voting.`,
          fontSize: "16px",
          textAlign: "left",
        },
      },
      fidgetType: "text",
      id: "text:gnars-proposal-info",
    },
    "links:gnars-proposal-links": {
      config: {
        editable: false,
        data: {},
        settings: {
          title: "Follow-up links",
          links: [
            { title: "Forum thread", url: `https://forum.nouns.wtf/c/gnars/${proposalId}` },
            { title: "Snapshot space", url: "https://snapshot.org/#/gnarsdao.eth" },
            { title: "Treasury view", url: "https://nouns.center/dao/gnars/treasury" },
          ],
        },
      },
      fidgetType: "links",
      id: "links:gnars-proposal-links",
    },
  };

  const layoutItems = [
    {
      w: 12,
      h: 8,
      x: 0,
      y: 0,
      i: "iframe:gnars-proposal",
      minW: 4,
      maxW: 36,
      minH: 4,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 6,
      h: 5,
      x: 0,
      y: 8,
      i: "text:gnars-proposal-info",
      minW: 3,
      maxW: 36,
      minH: 3,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 6,
      h: 5,
      x: 6,
      y: 8,
      i: "links:gnars-proposal-links",
      minW: 3,
      maxW: 36,
      minH: 3,
      maxH: 36,
      moved: false,
      static: false,
    },
  ];

  config.layoutDetails.layoutConfig.layout = layoutItems;
  return config;
};

export default createInitialProposalSpaceConfigForProposalId;
