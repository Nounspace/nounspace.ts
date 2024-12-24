import React from "react";

export type UserMetadata = {
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
};

export const generateContractMetadataHtml = (
  contractAddress?: string | null,
) => {
  const title = `Base Contract ${contractAddress} on Nounspace`;
  const spaceUrl = `https://nounspace.com/t/base/${contractAddress}`;

  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      <meta property="twitter:domain" content="https://nounspace.com/" />
      <meta property="og:url" content={spaceUrl} />
      <meta property="twitter:url" content={spaceUrl} />
    </>
  );
};
