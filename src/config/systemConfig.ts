import { nounsBrand } from './brand/nouns.brand';
import { nounsAssets } from './assets/nouns.assets';
import { nounsTheme } from './theme/nouns.theme';
import { nounsContent } from './content/nouns.content';
import { nounsCommunity } from './community/nouns.community';
import { nounsFidgets } from './fidgets/nouns.fidgets';
import { nounsHomePage } from './spaces/nouns.home';

export interface SystemConfig {
  brand: BrandConfig;
  assets: AssetConfig;
  theme: ThemeConfig;
  content: ContentConfig;
  community: CommunityConfig;
  fidgets: FidgetConfig;
  homePage: HomePageConfig;
}

export interface BrandConfig {
  name: string;
  displayName: string;
  tagline: string;
  description: string;
}

export interface AssetConfig {
  logos: {
    main: string;
    icon: string;
    favicon: string;
    appleTouch: string;
    og: string;
    splash: string;
  };
}

export interface ThemeConfig {
  default: ThemeProperties;
  nounish: ThemeProperties;
  gradientAndWave: ThemeProperties;
  colorBlobs: ThemeProperties;
  floatingShapes: ThemeProperties;
  imageParallax: ThemeProperties;
  shootingStar: ThemeProperties;
  squareGrid: ThemeProperties;
  tesseractPattern: ThemeProperties;
  retro: ThemeProperties;
}

export interface ThemeProperties {
  id: string;
  name: string;
  properties: {
    font: string;
    fontColor: string;
    headingsFont: string;
    headingsFontColor: string;
    background: string;
    backgroundHTML: string;
    musicURL: string;
    fidgetBackground: string;
    fidgetBorderWidth: string;
    fidgetBorderColor: string;
    fidgetShadow: string;
    fidgetBorderRadius: string;
    gridSpacing: string;
  };
}

export interface ContentConfig {
  faq: Array<{
    question: string;
    answer: string;
  }>;
  learning: Array<{
    title: string;
    href: string;
    image: string;
  }>;
  tutorial: {
    title: string;
    text: string;
    styling: {
      fontFamily: string;
      fontColor: string;
      headingsFontFamily: string;
      headingsFontColor: string;
      backgroundColor: string;
      borderColor: string;
    };
  };
  sections: {
    getANoun: Array<{
      key: string;
      title: string;
      description: string;
      buttonLabel: string;
      href: string;
      image: string;
    }>;
    alreadyOwn: Array<{
      title: string;
      description: string;
      buttonLabel: string;
      href: string;
      image: string;
    }>;
    journey: Array<{
      title: string;
      description: string;
      buttonLabel: string;
      href: string;
      image: string;
      footer?: string;
    }>;
    fundedProjects: Array<{
      title: string;
      image: string;
      href: string;
    }>;
    video: {
      thumbnail: string;
      url: string;
    };
    sampleNounIds: bigint[];
  };
}

export interface CommunityConfig {
  daos: Array<{
    name: string;
    contract: string;
    graphUrl: string;
    icon?: string;
  }>;
}

export interface FidgetConfig {
  enabled: string[];
  disabled: string[];
  custom: any[];
  defaultLayout: {
    layoutFidget: string;
    layout: Array<{
      w: number;
      h: number;
      x: number;
      y: number;
      i: string;
      minW: number;
      maxW: number;
      minH: number;
      maxH: number;
      moved: boolean;
      static: boolean;
    }>;
  };
}

export interface HomePageConfig {
  defaultTab: string;
  tabOrder: string[];
  tabs: {
    [key: string]: TabConfig;
  };
  layout: {
    defaultLayoutFidget: string;
    gridSpacing: number;
    theme: {
      background: string;
      fidgetBackground: string;
      font: string;
      fontColor: string;
    };
  };
}

export interface TabConfig {
  name: string;
  displayName: string;
  layoutID: string;
  layoutDetails: LayoutFidgetDetails;
  theme: ThemeProperties;
  fidgetInstanceDatums: Record<string, FidgetInstanceData>;
  fidgetTrayContents: any[];
  isEditable: boolean;
  timestamp: string;
}

export interface LayoutFidgetDetails {
  layoutConfig: {
    layout: GridItem[];
  };
  layoutFidget: string;
}

export interface FidgetInstanceData {
  config: {
    data: any;
    editable: boolean;
    settings: Record<string, any>;
  };
  fidgetType: string;
  id: string;
}

export interface GridItem {
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  moved?: boolean;
  static?: boolean;
  resizeHandles?: string[];
  isBounded?: boolean;
}


// Export the Nouns configuration
export const nounsSystemConfig: SystemConfig = {
  brand: nounsBrand,
  assets: nounsAssets,
  theme: nounsTheme,
  content: nounsContent,
  community: nounsCommunity,
  fidgets: nounsFidgets,
  homePage: nounsHomePage,
};
