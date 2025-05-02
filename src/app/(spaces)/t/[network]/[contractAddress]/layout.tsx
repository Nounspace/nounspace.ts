import { WEBSITE_URL } from "@/constants/app";
import { Metadata } from "next/types";
import React from "react";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { EtherScanChainName } from "@/constants/etherscanChainIds";

// Default frame for layout
const defaultFrame = {
  version: "next",
  imageUrl: `${WEBSITE_URL}/images/nounspace_og_low.png`,
  button: {
    title: "Start Nounspace",
    action: {
      type: "launch_frame",
      url: WEBSITE_URL,
      name: "Nounspace",
      splashImageUrl: `${WEBSITE_URL}/images/nounspace_logo.png`,
      splashBackgroundColor: "#FFFFFF",
    },
  },
};

// Default metadata (used as fallback)
const defaultMetadata = {
  other: {
    "fc:frame": JSON.stringify(defaultFrame),
  },
};

export async function generateMetadata({
  params: { network, contractAddress, tabName: tabNameParam },
}): Promise<Metadata> {
  console.log("Generating metadata for contract space");
  console.log("Params:", { network, contractAddress, tabNameParam });
  if (!network || !contractAddress) {
    return defaultMetadata; // Return default metadata if no network/contractAddress
  }
  
  // Try to fetch token data using fetchMasterToken
  let symbol = "";
  let price = "";
  
  try {
    const tokenData = await fetchTokenData(
      contractAddress,
      null,
      network as string
    );

    console.log("Token data fetched:", tokenData);
    
    // Get symbol and price from tokenData
    symbol = tokenData?.symbol || "";
    
    // Get price from tokenData
    price = tokenData?.price_usd 
      ? `$${Number(tokenData.price_usd).toFixed(2)}` 
      : "";
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
  const tokenFrame = {
    version: "next",
    imageUrl: `${WEBSITE_URL}/images/nounspace_og_low.png`,
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
  const metadataWithFrame = {
    title: symbol ? `${symbol} ${price ? `- ${price}` : ""} | Nounspace` : "Token Space | Nounspace",
    description: symbol 
      ? `${symbol} ${price ? `(${price})` : ""} token information and trading on Nounspace, the customizable web3 social app built on Farcaster.`
      : "Token information and trading on Nounspace, the customizable web3 social app built on Farcaster.",
    other: {
      "fc:frame": JSON.stringify(tokenFrame),
    }
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
