import { WEBSITE_URL } from "@/constants/app";
import { merge } from "lodash";
import { Metadata } from "next";

export type CastMetadata = {
  username?: string;
  pfpUrl?: string;
  text?: string;
  imageUrl?: string;
};

export const getCastMetadataStructure = (
  cast: CastMetadata,
): Metadata => {
  if (!cast) {
    return {};
  }

  const { username, pfpUrl, text, imageUrl } = cast;

  const title = username ? `Cast by @${username}` : "Cast on Nounspace";

  const params = new URLSearchParams({
    username: username || "",
    pfpUrl: pfpUrl || "",
    text: text || "",
    imageUrl: imageUrl || "",
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
