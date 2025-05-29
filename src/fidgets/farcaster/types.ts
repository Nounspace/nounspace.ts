export enum CastReactionType {
  likes = "likes",
  recasts = "recasts",
  replies = "replies",
  quote = "quote",
  links = "links",
}

export interface Channel {
  id: string;
  name: string;
  image_url?: string;
  parent_url?: string;
  description?: string;
}

export interface FarcasterMention {
  fid: number;
  username: string;
  display_name: string;
  avatar_url: string;
}
