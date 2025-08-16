import React from "react";
import EmbededCast from "./EmbededCast";
import OnchainEmbed from "./OnchainEmbed";
import TweetEmbed from "./TweetEmbed";
import NounsBuildEmbed from "./NounsBuildEmbed";
import ParagraphXyzEmbed from "./ParagraphXyzEmbed";
import VideoEmbed from "./VideoEmbed";
import ImageEmbed from "./ImageEmbed";
import SmartFrameEmbed from "./SmartFrameEmbed";
import { isImageUrl, isVideoUrl } from "@/common/lib/utils/urls";
import { isWalrusUrl } from "@/common/lib/utils/walrus";
import CreateCastImage from "./createCastImage";

export type CastEmbed = {
  url?: string;
  castId?: {
    fid: number;
    hash: string | Uint8Array;
  };
  key?: string;
};

export const renderEmbedForUrl = (
  { url, castId, key }: CastEmbed,
  isCreateCast: boolean
) => {
  if (castId) {
    return <EmbededCast castId={castId} key={key} />;
  }
  if (!url) return null;

  // Check Walrus URLs first to ensure they are treated as videos
  if (isWalrusUrl(url)) {
    return <VideoEmbed url={url} key={key} />;
  }

  if (isImageUrl(url)) {
    return !isCreateCast ? (
      <ImageEmbed url={url} key={key} />
    ) : (
      <CreateCastImage url={url} key={key} />
    );
  }

  if (
    url.includes("i.imgur.com") ||
    url.startsWith("https://imagedelivery.net")
  ) {
    return !isCreateCast ? (
      <ImageEmbed url={url} key={key} />
    ) : (
      <CreateCastImage url={url} key={key} />
    );
  } else if (url.startsWith('"chain:')) {
    return <OnchainEmbed url={url} key={key} />;
  } else if (isVideoUrl(url)) {
    return <VideoEmbed url={url} key={key} />;
  } else if (url.startsWith("https://warpcast.com") && !url.includes("/~/")) {
    return <EmbededCast url={url} key={key} />;
  } else if (
    (url.includes("twitter.com") || url.startsWith("https://x.com")) &&
    url.includes("status/")
  ) {
    const tweetId = url.split("/").pop();
    return tweetId ? <TweetEmbed tweetId={tweetId} key={key} /> : null;
  } else if (url.startsWith("https://nouns.build")) {
    return <NounsBuildEmbed url={url} key={key} />;
  } else if (url.includes("paragraph.xyz") || url.includes("pgrph.xyz")) {
    return <ParagraphXyzEmbed url={url} key={key} />;
  } else if (!isImageUrl(url) && !isWalrusUrl(url)) {
    // Use smart frame detection to render Frame v2 when possible
    // Falls back to legacy frame system if Frame v2 metadata is not detected
    // Exclude Walrus URLs from smart frame detection
    return <SmartFrameEmbed url={url} key={key} />;
  } else {
    return null;
  }
};
