import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "./initialPersonSpace";
import { Address } from "viem";

export const createInitalProposalSpaceConfigForProposalId = (
  proposalId: Address,
  ownerId: Address,
  proposerAddress? : Address
): Omit<SpaceConfig, "isEditable"> => {
  const config = cloneDeep(INITIAL_SPACE_CONFIG_EMPTY);

  config.fidgetInstanceDatums = {
    "iframe:2f0a1c7b-da0c-474c-ad30-59915d0096b1": {
      config: {
        editable: true,
        data: {},
        settings: {
          url: `https://www.nouns.camp/proposals/${proposalId}?tab=description`,
          showOnMobile: true,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "iframe",
      id: "iframe:2f0a1c7b-da0c-474c-ad30-59915d0096b1",
    },
    "iframe:10e88b10-b999-4ddc-a577-bd0eeb6bc76d": {
      config: {
        editable: true,
        data: {},
        settings: {
          url: "https://euphonious-kulfi-5e5a30.netlify.app/?id=" + proposalId,
          showOnMobile: true,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "iframe",
      id: "iframe:10e88b10-b999-4ddc-a577-bd0eeb6bc76d",
    },
    "iframe:1afc071b-ce6b-4527-9419-f2e057a9fb0a": {
      config: {
        editable: true,
        data: {},
        settings: {
          url: `https://www.nouns.camp/proposals/${proposalId}?tab=activity`,
          showOnMobile: true,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "iframe",
      id: "iframe:1afc071b-ce6b-4527-9419-f2e057a9fb0a",
    },
    "iframe:ffb3cd56-3203-4b94-b842-adab9a7eabc9": {
      config: {
        editable: true,
        data: {},
        settings: {
          url: `https://chat-fidget.vercel.app/?room=prop%20${proposalId}%20chat&owner=${proposerAddress}`,
          showOnMobile: true,
          background: "var(--user-theme-fidget-background)",
          fidgetBorderWidth: "var(--user-theme-fidget-border-width)",
          fidgetBorderColor: "var(--user-theme-fidget-border-color)",
          fidgetShadow: "var(--user-theme-fidget-shadow)",
        },
      },
      fidgetType: "iframe",
      id: "iframe:ffb3cd56-3203-4b94-b842-adab9a7eabc9",
    },
  };

  config.layoutDetails = {
    layoutConfig: {
      layout: [
        {
          w: 4,
          h: 10,
          x: 0,
          y: 0,
          i: "iframe:2f0a1c7b-da0c-474c-ad30-59915d0096b1",
          minW: 2,
          maxW: 36,
          minH: 2,
          maxH: 36,
          moved: false,
          static: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          isBounded: false,
        },
        {
          w: 4,
          h: 4,
          x: 4,
          y: 0,
          i: "iframe:10e88b10-b999-4ddc-a577-bd0eeb6bc76d",
          minW: 2,
          maxW: 36,
          minH: 2,
          maxH: 36,
          moved: false,
          static: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
        },
        {
          w: 4,
          h: 10,
          x: 8,
          y: 0,
          i: "iframe:1afc071b-ce6b-4527-9419-f2e057a9fb0a",
          minW: 2,
          maxW: 36,
          minH: 2,
          maxH: 36,
          moved: false,
          static: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          isBounded: false,
        },
        {
          w: 4,
          h: 6,
          x: 4,
          y: 4,
          i: "iframe:ffb3cd56-3203-4b94-b842-adab9a7eabc9",
          minW: 2,
          maxW: 36,
          minH: 2,
          maxH: 36,
          moved: false,
          static: false,
          resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          isBounded: false,
        },
      ],
    },
    layoutFidget: "default-layout-fidget", // Assign a valid string value
  };

  config.theme = {
    id: "Homebase-Tab 10-Theme",
    name: "Homebase-Tab 10-Theme",
    properties: {
      background: "#ffffff",
      backgroundHTML: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Aurora Borealis (Light Theme)</title>
          <style>
            /* ...existing styles... */
          </style>
        </head>
        <body>
          <div class="aurora"></div>
          <div class="overlay"></div>
        </body>
        </html>
      `,
      fidgetBackground: "#ffffff",
      fidgetBorderColor: "#eeeeee",
      fidgetBorderWidth: "1px",
      fidgetShadow: "none",
      font: "Inter",
      fontColor: "#000000",
      headingsFont: "Londrina Solid",
      headingsFontColor: "#000000",
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
    },
  };

  return config;
};

export default createInitalProposalSpaceConfigForProposalId;
