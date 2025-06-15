export enum AnalyticsEvent {
  CONNECT_WALLET = "Connect Wallet",
  SIGN_UP = "Sign Up",
  LINK_FID = "Link FID",
  CREATE_NEW_TAB = "Create New Tab",
  SAVE_SPACE_THEME = "Save Space Theme",
  SAVE_HOMEBASE_THEME = "Save Homebase Theme",
  ADD_FIDGET = "Add Fidget",
  EDIT_FIDGET = "Edit Fidget",
  CLICK_SPACE_FAIR_LAUNCH = "Click Space Fair Launch",
  CHANGE_TAB_NAME = "Change Tab Name",
  MUSIC_UPDATED = "Music Updated",
  CLICK_EXPLORE = "Explore Click",
  CLICK_HOMEBASE = "Click Homebase",
  CLICK_SEARCH = "Click Search",
  CLICK_NOTIFICATIONS = "Click Notifications",
  CLICK_MY_SPACE = "Click My Space",
  CLICK_CAST = "Click Cast",
  CLICK_EXPLORE_CARD = "Click Explore Card",
  CAST = "Cast",
  REPLY = "Reply",
  RECAST = "Recast",
  LIKE = "Like",
  PLAY = "Play",
  PAUSE = "Pause",
  GENERATE_BACKGROUND = "Generate Background",
  SPACE_REGISTERED = "Space Registered",
}

export type AnalyticsEventProperties = {
  [AnalyticsEvent.CONNECT_WALLET]: { hasNogs: boolean };
  [AnalyticsEvent.SIGN_UP]: Record<string, never>;
  [AnalyticsEvent.LINK_FID]: { fid: number };
  [AnalyticsEvent.CHANGE_TAB_NAME]: Record<string, never>;
  [AnalyticsEvent.CLICK_EXPLORE_CARD]: { slug: string };
  [AnalyticsEvent.CLICK_HOMEBASE]: Record<string, never>;
  [AnalyticsEvent.CLICK_NOTIFICATIONS]: Record<string, never>;
  [AnalyticsEvent.CLICK_SEARCH]: Record<string, never>;
  [AnalyticsEvent.CLICK_EXPLORE]: Record<string, never>;
  [AnalyticsEvent.CLICK_SPACE_FAIR_LAUNCH]: Record<string, never>;
  [AnalyticsEvent.CLICK_MY_SPACE]: Record<string, never>;
  [AnalyticsEvent.PLAY]: { url: string };
  [AnalyticsEvent.PAUSE]: { url: string };
  [AnalyticsEvent.LIKE]: { username: string; castId: string };
  [AnalyticsEvent.RECAST]: { username: string; castId: string };
  [AnalyticsEvent.REPLY]: { username: string; castId: string };
} & {
  [K in AnalyticsEvent]?: Record<string, any>;
};
