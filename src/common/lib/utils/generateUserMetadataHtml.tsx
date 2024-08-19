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
  const queryString = new URLSearchParams(userMetadata).toString();

  const title = `${displayName} (@${username}) on Nounspace`;
  const spaceUrl = `https://nounspace.com/s/${username}`;

  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      <meta property="twitter:domain" content="https://nounspace.com/" />
      <meta property="og:url" content={spaceUrl} />
      <meta property="twitter:url" content={spaceUrl} />
      <meta
        property="og:image"
        content={`https://954c-187-108-213-88.ngrok-free.app/api/metadata/spaces?${queryString}`}
      />
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
