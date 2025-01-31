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
  network?: string,
) => {
  const spaceUrl = `https://nounspace.com/t/${network}/${contractAddress}`;
  const priceInfo = tokenData?.geckoData?.price_usd
    ? ` - $${Number(tokenData.geckoData?.price_usd)}`
    : "";

  const symbol =
    tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "";

  const titleContent = symbol ? `${symbol}${priceInfo ? priceInfo : "Loading..."} USD` : "Loading...";

  return (
    <>
      <title>{titleContent}</title>
      {symbol && <meta property="og:title" content={titleContent} />}
      {symbol && <meta name="twitter:title" content={titleContent} />}
      <meta property="twitter:domain" content="https://nounspace.com/" />
      <meta property="og:url" content={spaceUrl} />
      <meta property="twitter:url" content={spaceUrl} />
    </>
  );
};
