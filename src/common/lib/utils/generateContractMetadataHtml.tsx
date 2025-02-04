import React from "react";
import { MasterToken } from "@/common/providers/TokenProvider";

export type UserMetadata = {
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
};

export const generateContractMetadataHtml = (
  contractAddress?: string | null,
  tokenData?: MasterToken | null,
) => {
  const spaceUrl = `https://nounspace.com/t/${tokenData?.network}/${contractAddress}`;
  const priceInfo = tokenData?.geckoData?.price_usd
    ? ` - $${Number(tokenData.geckoData?.price_usd)} USD`
    : "";

  const symbol =
    tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "";

  const title = `${symbol}${priceInfo}`;

  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={`${title}`} />
      <meta name="twitter:title" content={`${title}`} />
      <meta property="twitter:domain" content="https://nounspace.com/" />
      <meta property="og:url" content={spaceUrl} />
      <meta property="twitter:url" content={spaceUrl} />
    </>
  );
};
