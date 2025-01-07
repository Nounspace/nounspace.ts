import { WEBSITE_URL } from "@/constants/app";
import { merge } from "lodash";
import { Metadata } from "next";

export type UserMetadata = {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
};

export const getUserMetadataStructure = (
  userMetadata: UserMetadata,
): Metadata => {
  if (!userMetadata) {
    return {};
  }

  const { username, displayName, pfpUrl, bio } = userMetadata;

  const title = `${displayName} (@${username}) on Nounspace`;
  const spaceUrl = `https://nounspace.com/s/${username}`;

  const encodedDisplayName = encodeURIComponent(displayName || "");
  const encodedPfpUrl = encodeURIComponent(pfpUrl || "");
  const encodedBio = encodeURIComponent(bio || "");

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/spaces?username=${username}&displayName=${encodedDisplayName}&pfpUrl=${encodedPfpUrl}&bio=${encodedBio}`;

  const metadata = {
    title,
    openGraph: {
      title,
      url: spaceUrl,
    },
    twitter: {
      title,
      domain: "https://nounspace.com/",
      url: spaceUrl,
    },
  };

  if (bio) {
    merge(metadata, {
      description: bio,
      openGraph: {
        description: bio,
      },
      twitter: {
        description: bio,
      },
    });
  }
  if (pfpUrl) {
    merge(metadata, {
      twitter: {
        card: pfpUrl,
        image: ogImageUrl,
      },
      openGraph: {
        image: ogImageUrl,
      },
    });
  }

  return metadata;
};
