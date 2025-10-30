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
import { loadSystemConfig } from "@/config";

// Load system configuration
const config = loadSystemConfig();

// Convert configuration themes to the expected format
export const THEMES = [
  config.theme.default,
  {
    ...config.theme.gradientAndWave,
    properties: {
      ...config.theme.gradientAndWave.properties,
      backgroundHTML: gradientAndWave,
    },
  },
  {
    ...config.theme.colorBlobs,
    properties: {
      ...config.theme.colorBlobs.properties,
      backgroundHTML: colorBlobs,
    },
  },
  {
    ...config.theme.floatingShapes,
    properties: {
      ...config.theme.floatingShapes.properties,
      backgroundHTML: floatingShapes,
    },
  },
  {
    ...config.theme.imageParallax,
    properties: {
      ...config.theme.imageParallax.properties,
      backgroundHTML: imageParallax,
    },
  },
  {
    ...config.theme.shootingStar,
    properties: {
      ...config.theme.shootingStar.properties,
      backgroundHTML: shootingStar,
    },
  },
  {
    ...config.theme.squareGrid,
    properties: {
      ...config.theme.squareGrid.properties,
      backgroundHTML: squareGrid,
    },
  },
  {
    ...config.theme.tesseractPattern,
    properties: {
      ...config.theme.tesseractPattern.properties,
      backgroundHTML: tesseractPattern,
    },
  },
  {
    ...config.theme.retro,
    properties: {
      ...config.theme.retro.properties,
      backgroundHTML: retro,
    },
  },
  {
    ...config.theme.nounish,
    properties: {
      ...config.theme.nounish.properties,
      backgroundHTML: nounish,
    },
  },
];