export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  parent_url?: string | null;
}

export type FarcasterEmbed =
  | { url: string; castId?: undefined }
  | { url?: undefined; castId: { fid: number; hash: string | Uint8Array } };

export interface FarcasterMention {
  fid: number;
  username: string;
  display_name: string;
  avatar_url: string;
}

export enum CastReactionType {
  likes = "likes",
  recasts = "recasts",
  replies = "replies",
  links = "links",
  quote = "quote",
}
