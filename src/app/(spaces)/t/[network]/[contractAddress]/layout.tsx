import { WEBSITE_URL } from "@/constants/app";
import { Metadata } from "next/types";
import React from "react";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { getTokenMetadataStructure } from "@/common/lib/utils/tokenMetadata";
import { defaultFrame } from "@/common/lib/frames/metadata";
import { fetchClankerByAddress } from "@/common/data/queries/clanker";
import { fetchEmpireByAddress } from "@/common/data/queries/empireBuilder";
import { Address } from "viem";

// Default metadata (used as fallback)
const defaultMetadata = {
  other: {
    "fc:frame": JSON.stringify(defaultFrame),
  },
};

export async function generateMetadata({
  params,
}): Promise<Metadata> {
  const { network, contractAddress, tabName: tabNameParam } = await params;
  
  if (!network || !contractAddress) {
    return defaultMetadata; // Return default metadata if no network/contractAddress
  }
  
  // Try to fetch token data using fetchMasterToken
  let symbol = "";
  let price = "";
  let name = "";
  let imageUrl = "";
  let marketCap = "";
  let priceChange = "";
  
  try {
    // Replace Promise.all with Promise.allSettled for more resilient error handling
    const [tokenResult, clankerResult, empireResult] = await Promise.allSettled([
      fetchTokenData(contractAddress, null, network as string),
      fetchClankerByAddress(contractAddress as Address),
      fetchEmpireByAddress(contractAddress as Address),
    ]);

    const tokenData = tokenResult.status === 'fulfilled' ? tokenResult.value : null;
    const clankerData = clankerResult.status === 'fulfilled' ? clankerResult.value : null;
    const empireData = empireResult.status === 'fulfilled' ? empireResult.value : null;

    symbol = clankerData?.symbol || empireData?.token_symbol || tokenData?.symbol || "";
    name = clankerData?.name || empireData?.token_name || tokenData?.name || "";
    imageUrl =
      clankerData?.img_url ||
      (tokenData?.image_url !== "missing.png" ? tokenData?.image_url || "" : "");
    marketCap = tokenData?.market_cap_usd || "";
    priceChange = tokenData?.priceChange || "";

    if (tokenData?.price_usd && Number(tokenData.price_usd) !== 0) {
      const priceNumber = Number(tokenData.price_usd);
      const formatted = priceNumber.toLocaleString(undefined, {
        minimumFractionDigits: priceNumber < 0.01 ? 4 : 2,
        maximumFractionDigits: priceNumber < 0.01 ? 6 : 2,
      });
      price = `$${formatted}`;
    } else if (tokenData?.price_usd === "0" || Number(tokenData?.price_usd) === 0) {
      price = "TBD ";
    } else {
      price = "";
    }
  } catch (error) {
    console.error("Error fetching token data for frame metadata:", error);
  }
  
  // Process tabName parameter if it exists
  const tabName = tabNameParam ? decodeURIComponent(tabNameParam) : undefined;
  
  // Create Frame metadata for Farcaster with the correct path
  const frameUrl = tabName 
    ? `${WEBSITE_URL}/t/${network}/${contractAddress}/${encodeURIComponent(tabName)}`
    : `${WEBSITE_URL}/t/${network}/${contractAddress}`;
    
  // Create token frame with the symbol if available
  const queryParams = new URLSearchParams({
    name,
    symbol,
    imageUrl,
    address: contractAddress,
    marketCap,
    price,
    priceChange,
  });

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/token?${queryParams.toString()}`;

  const tokenFrame = {
    version: "next",
    imageUrl: ogImageUrl,
    button: {
      title: symbol ? `Visit ${symbol}` : "Visit Token Space",
      action: {
        type: "launch_frame",
        url: frameUrl,
        name: symbol ? `${symbol} on Nounspace` : "Token Space on Nounspace",
        splashImageUrl: `${WEBSITE_URL}/images/nounspace_logo.png`,
        splashBackgroundColor: "#FFFFFF",
      }
    }
  };
  
  // Create metadata object with token data if available
  const tokenMetadata = getTokenMetadataStructure({
    name,
    symbol,
    imageUrl,
    contractAddress,
    marketCap,
    price,
    priceChange,
    network,
  });

  const metadataWithFrame = {
    ...tokenMetadata,
    title: symbol ? `${symbol} ${price ? `- ${price}` : ""} | Nounspace` : "Token Space | Nounspace",
    description: symbol
      ? `${symbol} ${price ? `(${price})` : ""} token information and trading on Nounspace, the customizable web3 social app built on Farcaster.`
      : "Token information and trading on Nounspace, the customizable web3 social app built on Farcaster.",
    other: {
      "fc:frame": JSON.stringify(tokenFrame),
    },
  };
  
  return metadataWithFrame;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
