import { WEBSITE_URL } from "@/constants/app";
import React from "react";
import { getUserMetadata } from "./utils";
import type { Metadata, LayoutProps } from "next";
import { getUserMetadataStructure } from "@/common/lib/utils/userMetadata";
import { defaultFrame } from "@/common/lib/frames/metadata";

// Default metadata (used as fallback)
const defaultMetadata = {
  other: {
    "fc:frame": JSON.stringify(defaultFrame),
  },
};

export async function generateMetadata({
  params,
}: LayoutProps<{ handle?: string; tabName?: string }>): Promise<Metadata> {
  const { handle, tabName: tabNameParam } = await params;
  
  if (!handle) {
    return defaultMetadata; // Return default metadata if no handle
  }

  const userMetadata = await getUserMetadata(handle);
  if (!userMetadata) {
    const baseMetadata = getUserMetadataStructure({ username: handle });
    return {
      ...baseMetadata,
      other: { "fc:frame": JSON.stringify(defaultFrame) },
    };
  }

  // Process tabName parameter if it exists
  const tabName = tabNameParam ? decodeURIComponent(tabNameParam) : undefined;
  
  // Create Frame metadata for Farcaster with the correct path
  const frameUrl = tabName 
    ? `${WEBSITE_URL}/s/${handle}/${encodeURIComponent(tabName)}`
    : `${WEBSITE_URL}/s/${handle}`;
    
  const displayName =
    userMetadata?.displayName || userMetadata?.username || handle;

  // Build Open Graph image URL matching the dynamic metadata
  const encodedDisplayName = encodeURIComponent(displayName || "");
  const encodedPfpUrl = encodeURIComponent(userMetadata?.pfpUrl || "");
  const encodedBio = encodeURIComponent(userMetadata?.bio || "");
  const ogImageUrl = `${WEBSITE_URL}/api/metadata/spaces?username=${handle}&displayName=${encodedDisplayName}&pfpUrl=${encodedPfpUrl}&bio=${encodedBio}`;

  const spaceFrame = {
    version: "next",
    imageUrl: ogImageUrl,
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
