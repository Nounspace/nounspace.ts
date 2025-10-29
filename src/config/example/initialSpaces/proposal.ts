import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "../../initialSpaceConfig";
import { Address } from "viem";

export const createInitalProposalSpaceConfigForProposalId = (
  proposalId: string,
  proposerAddress: Address
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);
  config.tabNames = ["Proposal"];

  config.fidgetInstanceDatums = {
    "iframe:proposal-description": {
      config: {
        editable: true,
        data: {},
        settings: {
          url: `https://governance.example.com/proposals/${proposalId}`,
          showOnMobile: true,
          customMobileDisplayName: "Proposal",
          background: "var(--user-theme-fidget-background)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "iframe",
      id: "iframe:proposal-description",
    },
    "text:proposal-info": {
      config: {
        editable: false,
        data: {},
        settings: {
          content: "Example Community Proposal Information",
          fontSize: "16px",
          textAlign: "center"
        },
      },
      fidgetType: "text",
      id: "text:proposal-info",
    },
  };

  const layoutItems = [
    {
      w: 12,
      h: 6,
      x: 0,
      y: 0,
      i: "iframe:proposal-description",
      minW: 4,
      maxW: 36,
      minH: 4,
      maxH: 36,
      moved: false,
      static: false,
    },
    {
      w: 12,
      h: 4,
      x: 0,
      y: 6,
      i: "text:proposal-info",
      minW: 4,
      maxW: 36,
      minH: 2,
      maxH: 36,
      moved: false,
      static: false,
    },
  ];

  config.layoutDetails.layoutConfig.layout = layoutItems;

  return config;
};

export default createInitalProposalSpaceConfigForProposalId;
