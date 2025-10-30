export const exampleHomePage = {
  defaultTab: "Home",
  tabOrder: ["Home", "Social", "Resources"],
  tabs: {
    "Home": {
      name: "Home",
      displayName: "Home",
      layoutID: "example-home-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            {
              w: 12, h: 10, x: 0, y: 0,
              i: "text:example-welcome",
              minW: 2, maxW: 36, minH: 2, maxH: 36,
              moved: false, static: false,
              resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
              isBounded: false
            }
          ]
        },
        layoutFidget: "grid"
      },
      theme: {
        id: "example-home-theme",
        name: "Example Home Theme",
        properties: {
          background: "#ffffff",
          backgroundHTML: "",
          fidgetBackground: "#ffffff",
          fidgetBorderWidth: "1px",
          fidgetBorderColor: "#C0C0C0",
          fidgetShadow: "none",
          fidgetBorderRadius: "12px",
          font: "Inter",
          fontColor: "#000000",
          headingsFont: "Inter",
          headingsFontColor: "#000000",
          gridSpacing: "16",
          musicURL: ""
        }
      },
      fidgetInstanceDatums: {
        "text:example-welcome": {
          config: {
            data: {},
            editable: false,
            settings: {
              content: "Welcome to Example Community!",
              fontSize: "24px",
              textAlign: "center"
            }
          },
          fidgetType: "text",
          id: "text:example-welcome"
        }
      },
      fidgetTrayContents: [],
      isEditable: false,
      timestamp: new Date().toISOString()
    },
    "Social": {
      name: "Social",
      displayName: "Social",
      layoutID: "example-social-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            {
              w: 12, h: 8, x: 0, y: 0,
              i: "feed:example-social",
              minW: 2, maxW: 36, minH: 2, maxH: 36,
              moved: false, static: false,
              resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
              isBounded: false
            }
          ]
        },
        layoutFidget: "grid"
      },
      theme: {
        id: "example-social-theme",
        name: "Example Social Theme",
        properties: {
          background: "#f8f9fa",
          backgroundHTML: "",
          fidgetBackground: "#ffffff",
          fidgetBorderWidth: "1px",
          fidgetBorderColor: "#C0C0C0",
          fidgetShadow: "none",
          fidgetBorderRadius: "12px",
          font: "Inter",
          fontColor: "#000000",
          headingsFont: "Inter",
          headingsFontColor: "#000000",
          gridSpacing: "16",
          musicURL: ""
        }
      },
      fidgetInstanceDatums: {
        "feed:example-social": {
          config: {
            data: {},
            editable: false,
            settings: {
              feedType: "global"
            }
          },
          fidgetType: "feed",
          id: "feed:example-social"
        }
      },
      fidgetTrayContents: [],
      isEditable: false,
      timestamp: new Date().toISOString()
    },
    "Resources": {
      name: "Resources",
      displayName: "Resources",
      layoutID: "example-resources-layout",
      layoutDetails: {
        layoutConfig: {
          layout: [
            {
              w: 6, h: 6, x: 0, y: 0,
              i: "links:example-resources",
              minW: 2, maxW: 36, minH: 2, maxH: 36,
              moved: false, static: false,
              resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
              isBounded: false
            }
          ]
        },
        layoutFidget: "grid"
      },
      theme: {
        id: "example-resources-theme",
        name: "Example Resources Theme",
        properties: {
          background: "#ffffff",
          backgroundHTML: "",
          fidgetBackground: "#ffffff",
          fidgetBorderWidth: "1px",
          fidgetBorderColor: "#C0C0C0",
          fidgetShadow: "none",
          fidgetBorderRadius: "12px",
          font: "Inter",
          fontColor: "#000000",
          headingsFont: "Inter",
          headingsFontColor: "#000000",
          gridSpacing: "16",
          musicURL: ""
        }
      },
      fidgetInstanceDatums: {
        "links:example-resources": {
          config: {
            data: {},
            editable: false,
            settings: {
              links: [
                { title: "Documentation", url: "https://docs.example.com" },
                { title: "Community", url: "https://community.example.com" },
                { title: "Support", url: "https://support.example.com" }
              ]
            }
          },
          fidgetType: "links",
          id: "links:example-resources"
        }
      },
      fidgetTrayContents: [],
      isEditable: false,
      timestamp: new Date().toISOString()
    }
  },
  layout: {
    defaultLayoutFidget: "grid",
    gridSpacing: 16,
    theme: {
      background: "#ffffff",
      fidgetBackground: "#ffffff",
      font: "Inter",
      fontColor: "#000000"
    }
  }
};
