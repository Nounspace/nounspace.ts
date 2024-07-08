import {
  Inter,
  Roboto,
  Roboto_Mono,
  Open_Sans,
  Lato,
  Noto_Serif,
  Noto_Sans,
  Poppins,
  Raleway,
  Roboto_Condensed,
  Roboto_Slab,
  Source_Code_Pro,
  Space_Grotesk,
  Ubuntu,
  Work_Sans,
  Londrina_Solid,
} from "next/font/google";

import type { FontFamily } from "@/common/lib/theme";
import type { NextFontWithVariable } from "next/dist/compiled/@next/font";

export type FontConfig = {
  name: FontFamily;
  global?: boolean;
  config: NextFontWithVariable;
};

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const open_sans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
  weight: ["100", "300", "400", "700", "900"],
});

export const noto_serif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
  weight: ["400", "700"],
});
export const noto_sans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
  weight: ["400", "700"],
});

export const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const roboto_condensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

export const roboto_slab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  display: "swap",
});

export const source_code_pro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  display: "swap",
});

export const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const ubuntu = Ubuntu({
  subsets: ["latin"],
  variable: "--font-ubuntu",
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

export const work_sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const londrina_solid = Londrina_Solid({
  subsets: ["latin"],
  variable: "--font-londrina-solid",
  display: "swap",
  weight: ["100", "300", "400", "900"],
});

export const FONT_FAMILY_OPTIONS: FontConfig[] = [
  {
    name: "Theme Font",
    global: true,
    config: {
      variable: "--user-theme-font",
      className: ".user-theme-font",
      style: {
        fontFamily: "var(--user-theme-font)",
      },
    },
  },
  {
    name: "Theme Headings Font",
    global: true,
    config: {
      variable: "--user-theme-headings-font",
      className: ".user-theme-headings-font",
      style: {
        fontFamily: "var(--user-theme-headings-font)",
      },
    },
  },
  {
    name: "Inter",
    config: inter,
  },
  {
    name: "Roboto",
    config: roboto,
  },
  {
    name: "Roboto Mono",
    config: roboto_mono,
  },
  {
    name: "Open Sans",
    config: open_sans,
  },
  {
    name: "Lato",
    config: lato,
  },
  {
    name: "Space Grotesk",
    config: space_grotesk,
  },
  {
    name: "Ubuntu",
    config: ubuntu,
  },
  {
    name: "Work Sans",
    config: work_sans,
  },
  {
    name: "Noto Serif",
    config: noto_serif,
  },
  {
    name: "Noto Sans",
    config: noto_sans,
  },
  {
    name: "Poppins",
    config: poppins,
  },
  {
    name: "Raleway",
    config: raleway,
  },
  {
    name: "Source Code Pro",
    config: source_code_pro,
  },
  {
    name: "Roboto Condensed",
    config: roboto_condensed,
  },
  {
    name: "Roboto Slab",
    config: roboto_slab,
  },
  {
    name: "Londrina Solid",
    config: londrina_solid,
  },
];

export const FONT_FAMILY_OPTIONS_BY_NAME: {
  [font: FontFamily]: FontConfig;
} = FONT_FAMILY_OPTIONS.reduce(
  (acc, font) => ({
    ...acc,
    [font.name]: font,
  }),
  {},
);

// todo: optimize font loading
