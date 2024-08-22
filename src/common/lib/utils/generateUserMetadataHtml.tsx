import { WEBSITE_URL } from "@/constants/app";
import React from "react";

export type UserMetadata = {
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
};

export const generateUserMetadataHtml = (userMetadata?: UserMetadata) => {
  if (!userMetadata) {
    return null;
  }

  const { username, displayName, pfpUrl, bio } = userMetadata;
  const title = `${displayName} (@${username}) on Nounspace`;
  const spaceUrl = `https://nounspace.com/s/${username}`;

  const encodedDisplayName = encodeURIComponent(displayName || "");
  const encodedPfpUrl = encodeURIComponent(pfpUrl || "");
  const encodedBio = encodeURIComponent(bio || "");

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/spaces?username=${username}&displayName=${encodedDisplayName}&pfpUrl=${encodedPfpUrl}&bio=${encodedBio}`;

  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      <meta property="twitter:domain" content="https://nounspace.com/" />
      <meta property="og:url" content={spaceUrl} />
      <meta property="twitter:url" content={spaceUrl} />
      <meta property="og:image" content={ogImageUrl} />
      {bio && (
        <>
          <meta name="description" content={bio} />
          <meta property="og:description" content={bio} />
          <meta name="twitter:description" content={bio} />
        </>
      )}
      {pfpUrl && (
        <>
          <meta property="og:image" content={pfpUrl} />
          <meta name="twitter:card" content={pfpUrl} />
          <meta name="twitter:image" content={pfpUrl} />
        </>
      )}
    </>
  );
};
