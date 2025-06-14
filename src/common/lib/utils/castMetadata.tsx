import { WEBSITE_URL } from "@/constants/app";
import { merge } from "lodash";
import { Metadata } from "next";

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

  const dateTitle = timestamp
    ? new Date(
        typeof timestamp === "string"
          ? timestamp
          : timestamp.toString().length === 10
            ? timestamp * 1000
            : timestamp,
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : undefined;

  const title = dateTitle
    ? dateTitle
    : username
      ? `@${username} on Nounspace`
      : "Cast on Nounspace";

  const params = new URLSearchParams({
    username: username || "",
    displayName: displayName || "",
    pfpUrl: pfpUrl || "",
    text: text || "",
    imageUrl: imageUrl || "",
    timestamp: timestamp ? String(timestamp) : "",
  });

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/cast?${params.toString()}`;

  const metadata: Metadata = {
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
    merge(metadata, {
      description: text,
      openGraph: { description: text },
      twitter: { description: text },
    });
  }

  return metadata;
};
