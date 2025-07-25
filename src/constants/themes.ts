import {
  gradientAndWave,
  squareGrid,
  floatingShapes,
  tesseractPattern,
  colorBlobs,
  shootingStar,
  imageParallax,
  retro,
  nounish,
} from "./animatedBackgroundsHtml";

export const THEMES = [
  {
    id: "default",
    name: "Default",
    properties: {
      font: "Inter",
      fontColor: "#000000",
      headingsFont: "Inter",
      headingsFontColor: "#000000",
      background: "#ffffff",
      backgroundHTML: "",
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground: "#ffffff",
      fidgetBorderWidth: "1px",
      fidgetBorderColor: "#C0C0C0",
      fidgetShadow: "none",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  {
    id: "gradientAndWave",
    name: "Gradient & Wave",
    properties: {
      font: "Lato",
      fontColor: "#FFFFFF",
      headingsFont: "Lato",
      headingsFontColor: "#FFFFFF",
      background: "rgba(101,0,94,1)",
      backgroundHTML: gradientAndWave,
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground: "transparent",
      fidgetBorderWidth: "1px",
      fidgetBorderColor: "#ffffff",
      fidgetShadow: "none",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  {
    id: "colorBlobs",
    name: "Color Blobs",
    properties: {
      font: "Quicksand",
      fontColor: "#000000",
      headingsFont: "Roboto",
      headingsFontColor: "#000000",
      background: "#fbe9e0",
      backgroundHTML: colorBlobs,
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground: "rgb(255 255 255 / 0.5)",
      fidgetBorderWidth: "1px",
      fidgetBorderColor: "#ffffff",
      fidgetShadow: "none",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  {
    id: "floatingShapes",
    name: "Floating Shapes",
    properties: {
      font: "Anek Latin",
      fontColor: "#FFFFFF",
      headingsFont: "Anek Latin",
      headingsFontColor: "#FFFFFF",
      background: "#4e54c8",
      backgroundHTML: floatingShapes,
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground: "rgb(255 255 255 / 0)",
      fidgetBorderWidth: "0",
      fidgetBorderColor: "transparent",
      fidgetShadow: "none",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  {
    id: "imageParallax",
    name: "Image Parallax",
    properties: {
      font: "Inter",
      fontColor: "#FFFFFF",
      headingsFont: "Poppins",
      headingsFontColor: "#FFFFFF",
      background: "#000000",
      backgroundHTML: imageParallax,
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground: "rgb(0 0 0 / 0.6)",
      fidgetBorderWidth: "0",
      fidgetBorderColor: "transparent",
      fidgetShadow: "0 5px 15px rgba(0,0,0,0.55)",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  {
    id: "shootingStar",
    name: "Shooting Star",
    properties: {
      font: "Trispace",
      fontColor: "#FDF6B2",
      headingsFont: "Goldman",
      headingsFontColor: "#FACA15",
      background: "#000000",
      backgroundHTML: shootingStar,
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground: "transparent",
      fidgetBorderWidth: "1px",
      fidgetBorderColor: "#FACA15",
      fidgetShadow: "none",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  {
    id: "squareGrid",
    name: "Square Grid",
    properties: {
      font: "Inter",
      fontColor: "#FFFFFF",
      headingsFont: "Oswald",
      headingsFontColor: "#FFFFFF",
      background: "#4A1D96",
      backgroundHTML: squareGrid,
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground: "rgb(103 65 78 / 0.6)",
      fidgetBorderWidth: "4px",
      fidgetBorderColor: "#FFFFFF",
      fidgetShadow: "none",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  {
    id: "tesseractPattern",
    name: "Tesseract Pattern",
    properties: {
      font: "Exo",
      fontColor: "#000000",
      headingsFont: "Work Sans",
      headingsFontColor: "#000000",
      background: "#FFFFFF",
      backgroundHTML: tesseractPattern,
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground: "rgb(255 255 255 / 0.9)",
      fidgetBorderWidth: "2px",
      fidgetBorderColor: "#F8B4D9",
      fidgetShadow: "none",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  {
    id: "retro",
    name: "Retro",
    properties: {
      font: "IBM Plex Mono",
      fontColor: "#333333",
      headingsFont: "IBM Plex Mono",
      headingsFontColor: "#000000",
      background: "#ffffff",
      backgroundHTML: retro,
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground:
        "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(144,165,185,1) 100%)",
      fidgetBorderWidth: "2px",
      fidgetBorderColor: "#90A5B9",
      fidgetShadow: "none",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
  {
    id: "nounish",
    name: "Nounish",
    properties: {
      font: "Londrina Solid",
      fontColor: "#333333",
      headingsFont: "Work Sans",
      headingsFontColor: "#000000",
      background: "#ffffff",
      backgroundHTML: nounish,
      musicURL: "https://www.youtube.com/watch?v=dMXlZ4y7OK4&t=1804",
      fidgetBackground: "#FFFAFA",
      fidgetBorderWidth: "2px",
      fidgetBorderColor: "#F05252",
      fidgetShadow: "0 5px 15px rgba(0,0,0,0.55)",
      fidgetBorderRadius: "12px",
      gridSpacing: "16",
    },
  },
];