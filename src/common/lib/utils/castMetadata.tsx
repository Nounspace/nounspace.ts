import { WEBSITE_URL } from "@/constants/app";
// Avoid pulling in the whole lodash/merge for three shallow merges
import { Metadata } from "next";

const MAX_QUERY_FIELD_LENGTH = 320;

const safeValue = (value?: string | number): string =>
  value ? String(value).slice(0, MAX_QUERY_FIELD_LENGTH) : "";

export type CastMetadata = {
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  text?: string;
  imageUrl?: string;
  timestamp?: number | string;
};

export const getCastMetadataStructure = (
  cast: CastMetadata,
): Metadata => {
  if (!cast) {
    return {};
  }

  const { username, displayName, pfpUrl, text, imageUrl, timestamp } = cast;

  const title = displayName
    ? `${displayName} on Nounspace`
    : username
      ? `@${username} on Nounspace`
      : "Cast on Nounspace";

  const params = new URLSearchParams({
    username: safeValue(username),
    displayName: safeValue(displayName),
    pfpUrl: safeValue(pfpUrl),
    text: safeValue(text),
    imageUrl: safeValue(imageUrl),
    timestamp: safeValue(timestamp),
  });

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/cast?${params.toString()}`;

  let metadata: Metadata = {
    title,
    openGraph: {
      title,
      images: [ogImageUrl],
    },
    twitter: {
      title,
      images: [ogImageUrl],
      card: "summary_large_image",
    },
  };

  if (text) {
    metadata = {
      ...metadata,
      description: text,
      openGraph: { ...metadata.openGraph, description: text },
      twitter: { ...metadata.twitter, description: text },
    };
  }

  return metadata;
};
