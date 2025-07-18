import { WEBSITE_URL } from "@/constants/app";
import { merge } from "lodash";
import { Metadata } from "next";

export type CastMetadata = {
  hash?: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  text?: string;
};

export const getCastMetadataStructure = (
  cast: CastMetadata,
): Metadata => {
  if (!cast) {
    return {};
  }

  const { hash, username, displayName, pfpUrl, text } = cast;

  const title = displayName
    ? `${displayName}'s Cast`
    : username
    ? `@${username}'s Cast`
    : "Farcaster Cast";

  const castUrl =
    hash && username
      ? `${WEBSITE_URL}/homebase/c/${username}/${hash}`
      : undefined;

  const params = new URLSearchParams({
    username: username || "",
    displayName: displayName || "",
    pfpUrl: pfpUrl || "",
    text: text || "",
  });

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/cast?${params.toString()}`;

  const ogImage = {
    url: ogImageUrl,
    width: 1200,
    height: 630,
  };

  const metadata: Metadata = {
    title,
    openGraph: {
      title,
      url: castUrl,
      images: [ogImage],
    },
    twitter: {
      title,
      site: "https://nounspace.com/",
      images: [ogImage],
      card: "summary_large_image",
    },
  };

  if (text) {
    merge(metadata, {
      description: text,
      openGraph: { description: text },
      twitter: { description: text },
    });
  }

  return metadata;
};
