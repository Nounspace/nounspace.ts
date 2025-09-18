import type { CastAddBody } from "@farcaster/core";

export type Channel = {
  id: string;
  name: string;
  image_url?: string | null;
  parent_url?: string | null;
  description?: string | null;
  follower_count?: number;
};

export type FarcasterMention = {
  fid: number;
  username: string;
  display_name: string;
  avatar_url: string;
};

type BaseEmbed = CastAddBody["embeds"][number];

type EmbedWithStatus = BaseEmbed & {
  status?: string;
  key?: string;
};

export type FarcasterEmbed = EmbedWithStatus;

export enum CastReactionType {
  likes = "likes",
  recasts = "recasts",
  replies = "replies",
  links = "links",
  quote = "quote",
}
