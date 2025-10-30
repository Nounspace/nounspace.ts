import { TabConfig } from '../../systemConfig';

const createInitialProposalSpaceConfigForProposalId = (proposalId: string): TabConfig => ({
  name: "proposal",
  displayName: "Proposal",
  layoutID: "clanker-proposal-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            { w: 8, h: 4, x: 0, y: 0, i: "text" },
            { w: 4, h: 4, x: 8, y: 0, i: "SnapShot" },
            { w: 6, h: 4, x: 0, y: 4, i: "feed" },
            { w: 6, h: 4, x: 6, y: 4, i: "links" },
            { w: 12, h: 3, x: 0, y: 8, i: "gallery" }
          ]
        },
        layoutFidget: "grid"
      },
  theme: {
    id: "clanker-proposal-theme",
    name: "Clanker Proposal Theme",
    properties: {
      font: "Inter, system-ui, sans-serif",
      fontColor: "#ffffff",
      headingsFont: "Inter, system-ui, sans-serif",
      headingsFontColor: "#ff6b6b",
      background: "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)",
      backgroundHTML: "",
      musicURL: "",
      fidgetBackground: "rgba(255, 107, 107, 0.1)",
      fidgetBorderWidth: "2px",
      fidgetBorderColor: "#ff6b6b",
      fidgetShadow: "0 6px 24px rgba(255, 107, 107, 0.3)",
      fidgetBorderRadius: "16px",
      gridSpacing: "20px"
    }
  },
  fidgetInstanceDatums: {
    "text": {
      id: "text",
      fidgetType: "text",
      config: {
        data: { proposalId },
        editable: true,
        settings: {
          showProposalText: true,
          showTitle: true,
          showDescription: true
        }
      }
    },
    "SnapShot": {
      id: "SnapShot",
      fidgetType: "SnapShot",
      config: {
        data: { proposalId },
        editable: true,
        settings: {
          showVoting: true,
          showResults: true,
          showVoteCount: true
        }
      }
    },
    "feed": {
      id: "feed",
      fidgetType: "feed",
      config: {
        data: { proposalId },
        editable: true,
        settings: {
          showProposalDiscussions: true,
          maxCasts: 15
        }
      }
    },
    "links": {
      id: "links",
      fidgetType: "links",
      config: {
        data: { proposalId },
        editable: true,
        settings: {
          showProposalLinks: true,
          showExternalVoting: true
        }
      }
    },
    "gallery": {
      id: "gallery",
      fidgetType: "gallery",
      config: {
        data: { proposalId },
        editable: true,
        settings: {
          showProposalImages: true,
          maxImages: 8
        }
      }
    }
  },
  fidgetTrayContents: [
    "text",
    "SnapShot",
    "feed",
    "links",
    "gallery",
    "Video",
    "Chat"
  ],
  isEditable: true,
  timestamp: new Date().toISOString()
});

export default createInitialProposalSpaceConfigForProposalId;
