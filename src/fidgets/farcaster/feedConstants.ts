import { FeedType } from "@neynar/nodejs-sdk/build/api";

export enum FilterType {
  Channel = "channel_id",
  Users = "fids",
  Keyword = "keyword",
}

export const FEED_TYPES = [
  { name: "Following", value: FeedType.Following },
  { name: "For you", value: "for_you" },
  { name: "Trending", value: "trending" },
  { name: "Filter", value: FeedType.Filter },
];

export { FeedType };
