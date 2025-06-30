import { MasterToken } from "@/common/providers/TokenProvider";
import { Metadata } from "next/types";

export type UserMetadata = {
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
};

export const generateContractMetadataHtml = (
  contractAddress?: string | null,
  tokenData?: MasterToken | null
): Metadata => {
  const spaceUrl = `https://nounspace.com/t/${tokenData?.network}/${contractAddress}`;
  const priceInfo = tokenData?.geckoData?.price_usd
    ? ` - $${Number(tokenData.geckoData?.price_usd)} USD`
    : "";

  const symbol =
    tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "";

  const title = `${symbol}${priceInfo}`;

  const metadata = {
    title,
    openGraph: {
      title,
      url: spaceUrl,
    },
    twitter: {
      title,
      domain: spaceUrl,
      url: spaceUrl,
    },
  };

  return metadata;
};
