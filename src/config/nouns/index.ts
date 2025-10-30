import { nounsBrand } from './nouns.brand';
import { nounsAssets } from './nouns.assets';
import { nounsTheme } from './nouns.theme';
import { nounsCommunity } from './nouns.community';
import { nounsFidgets } from './nouns.fidgets';
import { nounsHomePage } from './nouns.home';
import { nounsNavigation } from './nouns.navigation';

export const nounsSystemConfig = {
  brand: nounsBrand,
  assets: nounsAssets,
  theme: nounsTheme,
  community: nounsCommunity,
  fidgets: nounsFidgets,
  homePage: nounsHomePage,
  navigation: nounsNavigation,
};

export { nounsBrand } from './nouns.brand';
export { nounsAssets } from './nouns.assets';
export { nounsTheme } from './nouns.theme';
export { nounsCommunity } from './nouns.community';
export { nounsFidgets } from './nouns.fidgets';
export { nounsHomePage } from './nouns.home';

// Export the initial space creators from config
export { default as createInitialProfileSpaceConfigForFid } from './initialSpaces/initialProfileSpace';
export { default as createInitialChannelSpaceConfig } from './initialSpaces/initialChannelSpace';
export { default as createInitialTokenSpaceConfigForAddress } from './initialSpaces/initialTokenSpace';
export { default as createInitalProposalSpaceConfigForProposalId } from './initialSpaces/initialProposalSpace';
export { default as INITIAL_HOMEBASE_CONFIG } from './initialSpaces/initialHomebase';
