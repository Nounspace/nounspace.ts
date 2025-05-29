import { WEBSITE_URL } from "@/constants/app";
import { merge } from "lodash";
import { Metadata } from "next";

export type TokenMetadata = {
  name?: string;
  symbol?: string;
  imageUrl?: string;
  contractAddress?: string;
  marketCap?: string;
  price?: string;
  priceChange?: string;
  network?: string;
};

export const getTokenMetadataStructure = (
  token: TokenMetadata,
): Metadata => {
  if (!token) {
    return {};
  }

  const {
    name,
    symbol,
    imageUrl,
    contractAddress,
    marketCap,
    price,
    priceChange,
    network,
  } = token;

  const spaceUrl =
    network && contractAddress
      ? `https://nounspace.com/t/${network}/${contractAddress}`
      : undefined;
  const title = symbol ? `${symbol} on Nounspace` : "Token Space on Nounspace";

  const params = new URLSearchParams({
    name: name || "",
    symbol: symbol || "",
    imageUrl: imageUrl || "",
    address: contractAddress || "",
    marketCap: marketCap || "",
    price: price || "",
    priceChange: priceChange || "",
  });

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/token?${params.toString()}`;

  const metadata: Metadata = {
    title,
    openGraph: {
      title,
      url: spaceUrl,
      images: [ogImageUrl],
    },
    twitter: {
      title,
      site: "https://nounspace.com/",
      images: [ogImageUrl],
      card: "summary_large_image",
    },
  };

  if (marketCap || priceChange || price) {
    const descParts: string[] = [];
    if (marketCap) descParts.push(`Market Cap: $${marketCap}`);
    if (price) descParts.push(`Price: $${price}`);
    if (priceChange) descParts.push(`24h: ${priceChange}%`);
    const description = descParts.join(" | ");
    merge(metadata, {
      description,
      openGraph: { description },
      twitter: { description },
    });
  }

  return metadata;
};
