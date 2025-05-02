import { WEBSITE_URL } from "@/constants/app";
import React from "react";
import { getUserMetadata } from "./utils";
import { Metadata } from "next/types";
import { getUserMetadataStructure } from "@/common/lib/utils/userMetadata";

// Default frame for layout
const defaultFrame = {
  version: "next",
  imageUrl: `${WEBSITE_URL}/images/nounspace_og.png`,
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
  params: { handle, tabName: tabNameParam },
}): Promise<Metadata> {
  if (!handle) {
    return defaultMetadata; // Return default metadata if no handle
  }

  const userMetadata = await getUserMetadata(handle);
  if (!userMetadata) {
    return defaultMetadata; // Return default metadata if no user metadata
  }

  // Process tabName parameter if it exists
  const tabName = tabNameParam ? decodeURIComponent(tabNameParam) : undefined;
  
  // Create Frame metadata for Farcaster with the correct path
  const frameUrl = tabName 
    ? `${WEBSITE_URL}/s/${handle}/${encodeURIComponent(tabName)}`
    : `${WEBSITE_URL}/s/${handle}`;
    
  const displayName = userMetadata?.displayName || userMetadata?.username || handle;
  
  const spaceFrame = {
    version: "next",
    imageUrl: `${WEBSITE_URL}/images/nounspace_og.png`,
    button: {
      title: `Visit ${displayName}'s Space`,
      action: {
        type: "launch_frame",
        url: frameUrl,
        name: `${displayName}'s Nounspace`,
        splashImageUrl: `${WEBSITE_URL}/images/nounspace_logo.png`,
        splashBackgroundColor: "#FFFFFF",
      }
    }
  };

  const baseMetadata = getUserMetadataStructure(userMetadata);
  
  // Type-safe way to add frame metadata
  const metadataWithFrame = {
    ...baseMetadata,
    title: `${displayName}'s Space | Nounspace`,
    description: userMetadata?.bio || 
      `${displayName}'s customized space on Nounspace, the customizable web3 social app built on Farcaster.`,
  };
  
  // Add the fc:frame metadata
  if (!metadataWithFrame.other) {
    metadataWithFrame.other = {};
  }
  
  metadataWithFrame.other['fc:frame'] = JSON.stringify(spaceFrame);
  
  return metadataWithFrame;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
