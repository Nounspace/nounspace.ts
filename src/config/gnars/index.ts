import { gnarsBrand } from "./gnars.brand";
import { gnarsAssets } from "./gnars.assets";
import { gnarsTheme } from "./gnars.theme";
import { gnarsCommunity } from "./gnars.community";
import { gnarsFidgets } from "./gnars.fidgets";
import { gnarsHomePage } from "./gnars.home";
import { gnarsExplorePage } from "./gnars.explore";
import { gnarsNavigation } from "./gnars.navigation";
import { gnarsUI } from "./gnars.ui";

export const gnarsSystemConfig = {
  brand: gnarsBrand,
  assets: gnarsAssets,
  theme: gnarsTheme,
  community: gnarsCommunity,
  fidgets: gnarsFidgets,
  homePage: gnarsHomePage,
  explorePage: gnarsExplorePage,
  navigation: gnarsNavigation,
  ui: gnarsUI,
};

export { gnarsBrand } from "./gnars.brand";
export { gnarsAssets } from "./gnars.assets";
export { gnarsTheme } from "./gnars.theme";
export { gnarsCommunity } from "./gnars.community";
export { gnarsFidgets } from "./gnars.fidgets";
export { gnarsHomePage } from "./gnars.home";
export { gnarsExplorePage } from "./gnars.explore";

export { default as createInitialProfileSpaceConfigForFid } from "./initialSpaces/profile";
export { default as createInitialChannelSpaceConfig } from "./initialSpaces/channel";
export { default as createInitialTokenSpaceConfigForAddress } from "./initialSpaces/token";
export { default as createInitialProposalSpaceConfigForProposalId } from "./initialSpaces/proposal";
export { default as INITIAL_HOMEBASE_CONFIG } from "./initialSpaces/homebase";
