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
  const spaceUrl = `https://nounspace.com/t/base/${contractAddress}`;
  const priceInfo = tokenData?.price_usd ? ` - $${tokenData.price_usd}` : "";
  const tokenSymbol = tokenData?.symbol ? `  ${tokenData.symbol}` : "";
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + "M";
    } else if (price >= 1000) {
      return (price / 1000).toFixed(1) + "k";
    } else if (price < 1) {
      return price.toFixed(4).replace(/(\.\d{2})\d+$/, "$1").replace(/\.?0+$/, "");
    }
    return price.toFixed(2).replace(/(\.\d{2})\d+$/, "$1").replace(/\.?0+$/, "");
  };

  const formattedPrice = tokenData?.price_usd ? ` - $${formatPrice(Number(tokenData.price_usd))}` : "";

  return (
    <>
      <title>{tokenSymbol}{priceInfo} USD</title>
      <meta property="og:title" content={`${tokenSymbol}${priceInfo}`} />
      <meta name="twitter:title" content={`${tokenSymbol}${priceInfo}`} />
      <meta property="twitter:domain" content="https://nounspace.com/" />
      <meta property="og:url" content={spaceUrl} />
      <meta property="twitter:url" content={spaceUrl} />
    </>
  );
};
