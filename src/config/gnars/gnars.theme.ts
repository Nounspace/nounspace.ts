const headlineFont = "'Space Grotesk', 'Inter', sans-serif";
const bodyFont = "'Inter', sans-serif";
const gnarsYellow = "#ffe564";
const gnarsOrange = "#ff8a3d";
const gnarsCharcoal = "#111111";

const baseTheme = {
  font: bodyFont,
  fontColor: gnarsCharcoal,
  headingsFont: headlineFont,
  headingsFontColor: gnarsCharcoal,
  background: gnarsYellow,
  backgroundHTML: "",
  musicURL: "https://www.youtube.com/watch?v=B9FzVhw8_bY",
  fidgetBackground: "#fff9d8",
  fidgetBorderWidth: "2px",
  fidgetBorderColor: "#ffcf33",
  fidgetShadow: "0 6px 24px rgba(0,0,0,0.08)",
  fidgetBorderRadius: "16px",
  gridSpacing: "16px",
};

export const gnarsTheme = {
  default: {
    id: "gnars-default",
    name: "Gnars Default",
    properties: baseTheme,
  },
  nounish: {
    id: "gnars-nounish",
    name: "Gnars Nounish",
    properties: {
      ...baseTheme,
      background: "linear-gradient(135deg, #fff07a 0%, #ffd142 40%, #ff8a3d 100%)",
      fidgetBackground: "#fff7c2",
      fidgetBorderColor: "#050505",
      fidgetBorderRadius: "8px",
      fidgetShadow: "0 12px 40px rgba(0,0,0,0.12)",
      musicURL: "https://soundcloud.com/gnars-dao/sets/gnars-playlists",
    },
  },
  gradientAndWave: {
    id: "gnars-gradient-wave",
    name: "Sunrise Lines",
    properties: {
      ...baseTheme,
      background: "linear-gradient(120deg, #ffec85 0%, #ff9a3c 50%, #ff5470 100%)",
      fidgetBackground: "rgba(255, 255, 255, 0.7)",
      fidgetBorderColor: "rgba(255, 255, 255, 0.8)",
      fidgetShadow: "0 12px 40px rgba(255, 140, 0, 0.15)",
    },
  },
  colorBlobs: {
    id: "gnars-color-blobs",
    name: "Spray Paint",
    properties: {
      ...baseTheme,
      backgroundHTML: "colorBlobs",
      background: "#feeec7",
      fidgetBackground: "rgba(255, 255, 255, 0.85)",
      fidgetBorderWidth: "1px",
      gridSpacing: "24px",
    },
  },
  floatingShapes: {
    id: "gnars-floating-shapes",
    name: "Float Session",
    properties: {
      ...baseTheme,
      backgroundHTML: "floatingShapes",
      background: "#ffb769",
      fontColor: "#ffffff",
      headingsFontColor: "#ffffff",
      fidgetBackground: "rgba(0,0,0,0.35)",
      fidgetBorderColor: "rgba(255,255,255,0.2)",
      fidgetShadow: "0 12px 40px rgba(0,0,0,0.35)",
    },
  },
  imageParallax: {
    id: "gnars-image-parallax",
    name: "Mountain Lines",
    properties: {
      ...baseTheme,
      backgroundHTML: "imageParallax",
      background: "#050505",
      fontColor: "#ffffff",
      headingsFontColor: "#ffe564",
      fidgetBackground: "rgba(0,0,0,0.6)",
      fidgetBorderColor: "rgba(255,255,255,0.2)",
      fidgetShadow: "0 12px 40px rgba(0,0,0,0.45)",
    },
  },
  shootingStar: {
    id: "gnars-shooting-star",
    name: "Night Session",
    properties: {
      ...baseTheme,
      backgroundHTML: "shootingStar",
      background: "#070707",
      fontColor: "#fff7d6",
      headingsFontColor: "#ffe564",
      fidgetBackground: "rgba(17,17,17,0.7)",
      fidgetBorderColor: "#ffe564",
      fidgetShadow: "0 16px 40px rgba(0,0,0,0.55)",
    },
  },
  squareGrid: {
    id: "gnars-square-grid",
    name: "Street Grid",
    properties: {
      ...baseTheme,
      backgroundHTML: "squareGrid",
      background: "#222222",
      fontColor: "#fefefe",
      headingsFontColor: "#ffe564",
      fidgetBackground: "#1a1a1a",
      fidgetBorderColor: "#404040",
      fidgetBorderRadius: "6px",
    },
  },
  tesseractPattern: {
    id: "gnars-tesseract-pattern",
    name: "Tesseract Shred",
    properties: {
      ...baseTheme,
      backgroundHTML: "tesseractPattern",
      background: "#ffffff",
      fidgetBackground: "rgba(255,255,255,0.75)",
      fidgetBorderColor: "#ffd142",
      fidgetBorderWidth: "2px",
      gridSpacing: "20px",
    },
  },
  retro: {
    id: "gnars-retro",
    name: "Arcade Session",
    properties: {
      ...baseTheme,
      backgroundHTML: "retro",
      background: "#f7f7f7",
      font: "'Press Start 2P', 'Space Grotesk', sans-serif",
      fontColor: "#000000",
      fidgetBackground: "#ffffff",
      fidgetBorderColor: "#050505",
      fidgetBorderRadius: "0px",
      fidgetShadow: "0 12px 40px rgba(0,0,0,0.2)",
    },
  },
};
