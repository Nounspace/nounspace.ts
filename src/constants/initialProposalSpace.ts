import { SpaceConfig } from "@/app/(spaces)/Space";
import { cloneDeep } from "lodash";
import { INITIAL_SPACE_CONFIG_EMPTY } from "./initialPersonSpace";
import { Address } from "viem";

export const createInitalProposalSpaceConfigForProposalId = (
  proposalId: Address,
  ownerId: Address,
  proposerAddress?: Address
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
          customMobileDisplayName: "Proposal",
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
          customMobileDisplayName: "TLDR",
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
          customMobileDisplayName: "Activity",
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
          customMobileDisplayName: "Chat",
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
          h: 6,
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
          h: 4,
          x: 4,
          y: 6,
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
      backgroundHTML: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Nouns DAO Fun Animated Background</title>
  <style>
    /* Reset and basic setup */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden; /* Hide overflow so no scrollbars appear during animations */
    }

    /* Container with an animated multi-stop gradient */
    .background {
      position: relative;
      width: 100%;
      height: 100%;
      /* A single gradient with multiple color stops for a smooth blend */
      background: linear-gradient(
        160deg,
        #FCCD04 0%,
        #E80173 20%,
        #45AAF2 40%,
        #23D160 60%,
        #FDB900 80%,
        #C8A2C8 100%
      );
      /* Increase the background size and animate its position for a continuous flowing effect */
      background-size: 400% 400%;
      animation: gradientFlow 30s ease-in-out infinite;
    }

    @keyframes gradientFlow {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    /* Noggly magic: each "noggles" element floats up from bottom and spins */
    .noggles {
      position: absolute;
      bottom: -15%;
      width: 60px;
      height: 60px;
      background-image: url("https://nouns.wtf/static/media/noggles.7644bfd0.svg");
      background-repeat: no-repeat;
      background-size: contain;
      opacity: 0;
      animation-name: floatUp;
      animation-iteration-count: infinite;
      animation-fill-mode: forwards;
    }

    @keyframes floatUp {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      100% {
        transform: translateY(-120vh) rotate(1080deg);
        opacity: 0;
      }
    }

    /* Add multiple noggles instances with varied positions (left), durations, delays, and timing functions for variety. */
    .noggles:nth-child(1) {
      left: 5%;
      animation-duration: 8s;
      animation-timing-function: ease-in-out;
    }
    .noggles:nth-child(2) {
      left: 15%;
      animation-duration: 9s;
      animation-delay: 2s;
      animation-timing-function: linear;
    }
    .noggles:nth-child(3) {
      left: 25%;
      animation-duration: 10s;
      animation-delay: 4s;
      animation-timing-function: ease;
    }
    .noggles:nth-child(4) {
      left: 35%;
      animation-duration: 11s;
      animation-delay: 1s;
      animation-timing-function: ease-in-out;
    }
    .noggles:nth-child(5) {
      left: 45%;
      animation-duration: 13s;
      animation-delay: 3s;
      animation-timing-function: linear;
    }
    .noggles:nth-child(6) {
      left: 55%;
      animation-duration: 9s;
      animation-delay: 5s;
      animation-timing-function: ease-in-out;
    }
    .noggles:nth-child(7) {
      left: 65%;
      animation-duration: 12s;
      animation-delay: 1s;
      animation-timing-function: ease;
    }
    .noggles:nth-child(8) {
      left: 75%;
      animation-duration: 10s;
      animation-delay: 6s;
      animation-timing-function: ease-in-out;
    }
    .noggles:nth-child(9) {
      left: 85%;
      animation-duration: 12s;
      animation-delay: 2s;
      animation-timing-function: linear;
    }
    .noggles:nth-child(10) {
      left: 92%;
      animation-duration: 14s;
      animation-delay: 4s;
      animation-timing-function: ease;
    }
    .noggles:nth-child(11) {
      left: 10%;
      animation-duration: 11s;
      animation-delay: 7s;
      animation-timing-function: ease-in-out;
    }
    .noggles:nth-child(12) {
      left: 20%;
      animation-duration: 9s;
      animation-delay: 3s;
      animation-timing-function: linear;
    }
    .noggles:nth-child(13) {
      left: 30%;
      animation-duration: 8s;
      animation-delay: 1s;
      animation-timing-function: ease;
    }
    .noggles:nth-child(14) {
      left: 40%;
      animation-duration: 12s;
      animation-delay: 5s;
      animation-timing-function: ease;
    }
    .noggles:nth-child(15) {
      left: 50%;
      animation-duration: 10s;
      animation-delay: 2s;
      animation-timing-function: ease-in-out;
    }
    .noggles:nth-child(16) {
      left: 60%;
      animation-duration: 14s;
      animation-delay: 6s;
      animation-timing-function: linear;
    }
    .noggles:nth-child(17) {
      left: 70%;
      animation-duration: 11s;
      animation-delay: 4s;
      animation-timing-function: ease;
    }
    .noggles:nth-child(18) {
      left: 80%;
      animation-duration: 8s;
      animation-delay: 7s;
      animation-timing-function: ease-in-out;
    }
    .noggles:nth-child(19) {
      left: 88%;
      animation-duration: 10s;
      animation-delay: 3s;
      animation-timing-function: ease;
    }
    .noggles:nth-child(20) {
      left: 95%;
      animation-duration: 13s;
      animation-delay: 1s;
      animation-timing-function: linear;
    }
  </style>
</head>
<body>
  <div class="background">
    <!-- 20 noggles elements -->
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
    <div class="noggles"></div>
  </div>
</body>
</html>`,
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
