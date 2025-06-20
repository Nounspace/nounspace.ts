export interface ThemeSettings {
  id: string;
  name: string;
  properties: ThemeProperties;
}

export interface UserTheme extends ThemeSettings {
  properties: {
    font: FontFamily;
    fontColor: Color;
    headingsFont: FontFamily;
    headingsFontColor: Color;
    background: Color;
    backgroundHTML: string;
    musicURL: string;
    fidgetBackground: Color;
    fidgetBorderWidth: string;
    fidgetBorderColor: Color;
    fidgetShadow: string;
    fidgetBorderRadius?: string;
    gridSpacing?: string;
  };
}

export type ThemeProperties = {
  [key: string]: Color | FontFamily | MusicSource | string;
};

// Sizes
export type CSSUnit =
  | "cm"
  | "mm"
  | "in"
  | "px"
  | "pt"
  | "pc"
  | "em"
  | "rem"
  | "vw"
  | "vh"
  | "vmin"
  | "vmax"
  | "%";
export type CSSSize = `${number}${CSSUnit}`;

// Typography
export type FontFamily = string;

// Colors
export type Color =
  | HexColor
  | RGBColor
  | RGBAColor
  | HSLColor
  | HSLAColor
  | NamedColor
  | LinearGradientColor;
export type HexColor = `#${string}`;
export type RGBColor =
  `rgb\\s*\\(\\s*${number}\\s*,\\s*${number}\\s*,\\s*${number}\\s*\\)\\s*|\\s*rgb\\s*\\(\\s*${number}%\\s*,\\s*${number}%\\s*,\\s*${number}%\\s*\\)`;
export type RGBAColor =
  `rgba\\s*\\(\\s*${number}\\s*,\\s*${number}\\s*,\\s*${number}\\s*,\\s*${number | `${number}%`}\\s*\\)\\s*|\\s*rgba\\s*\\(\\s*${number}%\\s*,\\s*${number}%\\s*,\\s*${number}%\\s*,\\s*${number | `${number}%`}\\s*\\)`;
export type HSLColor =
  `hsl\\s*\\(\\s*${number}\\s*,\\s*${number}%\\s*,\\s*${number}%\\s*\\)`;
export type HSLAColor =
  `hsla\\s*\\(\\s*${number}\\s*,\\s*${number}%\\s*,\\s*${number}%\\s*,\\s*${number | `${number}%`}\\s*\\)`;
export type LinearGradientColor = `linear-gradient(${string})`;
export type NamedColor =
  | "aliceblue"
  | "antiquewhite"
  | "aqua"
  | "aquamarine"
  | "azure"
  | "beige"
  | "bisque"
  | "black"
  | "blanchedalmond"
  | "blue"
  | "blueviolet"
  | "brown"
  | "burlywood"
  | "cadetblue"
  | "chartreuse"
  | "chocolate"
  | "coral"
  | "cornflowerblue"
  | "cornsilk"
  | "crimson"
  | "cyan"
  | "darkblue"
  | "darkcyan"
  | "darkgoldenrod"
  | "darkgray"
  | "darkgreen"
  | "darkgrey"
  | "darkkhaki"
  | "darkmagenta"
  | "darkolivegreen"
  | "darkorange"
  | "darkorchid"
  | "darkred"
  | "darksalmon"
  | "darkseagreen"
  | "darkslateblue"
  | "darkslategray"
  | "darkslategrey"
  | "darkturquoise"
  | "darkviolet"
  | "deeppink"
  | "deepskyblue"
  | "dimgray"
  | "dimgrey"
  | "dodgerblue"
  | "firebrick"
  | "floralwhite"
  | "forestgreen"
  | "fuchsia"
  | "gainsboro"
  | "ghostwhite"
  | "gold"
  | "goldenrod"
  | "gray"
  | "green"
  | "greenyellow"
  | "grey"
  | "honeydew"
  | "hotpink"
  | "indianred"
  | "indigo"
  | "ivory"
  | "khaki"
  | "lavender"
  | "lavenderblush"
  | "lawngreen"
  | "lemonchiffon"
  | "lightblue"
  | "lightcoral"
  | "lightcyan"
  | "lightgoldenrodyellow"
  | "lightgray"
  | "lightgreen"
  | "lightgrey"
  | "lightpink"
  | "lightsalmon"
  | "lightseagreen"
  | "lightskyblue"
  | "lightslategray"
  | "lightslategrey"
  | "lightsteelblue"
  | "lightyellow"
  | "lime"
  | "limegreen"
  | "linen"
  | "magenta"
  | "maroon"
  | "mediumaquamarine"
  | "mediumblue"
  | "mediumorchid"
  | "mediumpurple"
  | "mediumseagreen"
  | "mediumslateblue"
  | "mediumspringgreen"
  | "mediumturquoise"
  | "mediumvioletred"
  | "midnightblue"
  | "mintcream"
  | "mistyrose"
  | "moccasin"
  | "navajowhite"
  | "navy"
  | "oldlace"
  | "olive"
  | "olivedrab"
  | "orange"
  | "orangered"
  | "orchid"
  | "palegoldenrod"
  | "palegreen"
  | "paleturquoise"
  | "palevioletred"
  | "papayawhip"
  | "peachpuff"
  | "peru"
  | "pink"
  | "plum"
  | "powderblue"
  | "purple"
  | "red"
  | "rosybrown"
  | "royalblue"
  | "saddlebrown"
  | "salmon"
  | "sandybrown"
  | "seagreen"
  | "seashell"
  | "sienna"
  | "silver"
  | "skyblue"
  | "slateblue"
  | "slategray"
  | "slategrey"
  | "snow"
  | "springgreen"
  | "steelblue"
  | "tan"
  | "teal"
  | "thistle"
  | "tomato"
  | "turquoise"
  | "violet"
  | "wheat"
  | "white"
  | "whitesmoke"
  | "yellow"
  | "yellowgreen"
  | "transparent"
  | "currentColor";
