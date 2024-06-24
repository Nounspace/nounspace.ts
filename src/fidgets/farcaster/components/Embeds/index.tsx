import React from "react";
import EmbededCast from "./EmbededCast";
import OnchainEmbed from "./OnchainEmbed";
import TweetEmbed from "./TweetEmbed";
import NounsBuildEmbed from "./NounsBuildEmbed";
import ParagraphXyzEmbed from "./ParagraphXyzEmbed";
import VideoEmbed from "./VideoEmbed";
import WarpcastImage from "./WarpcastImage";
import FrameEmbed from "./FrameEmbed";
import { isImageUrl } from "@/common/lib/utils/urls";

export type CastEmbed = {
  url?: string;
  castId?: {
    fid: number;
    hash: string | Uint8Array;
  };
};

export const renderEmbedForUrl = ({ url, castId }: CastEmbed) => {
  if (castId) {
    return <EmbededCast castId={castId} />;
  }
  if (!url) return null;

  if (
    url.includes("i.imgur.com") ||
    url.startsWith("https://imagedelivery.net")
  ) {
    return <WarpcastImage url={url} />;
  } else if (url.startsWith('"chain:')) {
    return <OnchainEmbed url={url} />;
  } else if (url.startsWith("https://stream.warpcast.com")) {
    return <VideoEmbed url={url} />;
  } else if (url.startsWith("https://warpcast.com") && !url.includes("/~/")) {
    return <EmbededCast url={url} />;
  } else if (
    (url.includes("twitter.com") || url.startsWith("https://x.com")) &&
    url.includes("status/")
  ) {
    const tweetId = url.split("/").pop();
    return tweetId ? <TweetEmbed tweetId={tweetId} /> : null;
  } else if (url.startsWith("https://nouns.build")) {
    return <NounsBuildEmbed url={url} />;
  } else if (url.includes("paragraph.xyz") || url.includes("pgrph.xyz")) {
    return <ParagraphXyzEmbed url={url} />;
  } else if (!isImageUrl(url)) {
    return <FrameEmbed url={url} />;
  } else {
    return null;
  }
};
