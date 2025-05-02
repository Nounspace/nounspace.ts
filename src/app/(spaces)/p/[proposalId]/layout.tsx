import { Metadata } from "next/types";
import React from "react";
import { WEBSITE_URL } from "@/constants/app";
import { loadProposalData } from "./utils";
import { defaultFrame } from "@/common/lib/frames/metadata";

const defaultMetadata = {
  other: {
    'fc:frame': JSON.stringify(defaultFrame),
  },
};

/**
 * Extracts the first URL ending with jpeg, jpg, png, or containing "image" in the path
 */
function extractFirstImageUrl(text: string): string | null {
  if (!text) return null;
  
  // Match URLs that end with image extensions or contain 'image' in the path
  const regex = /(https?:\/\/[^\s]+\.(jpeg|jpg|png|gif|webp)|https?:\/\/[^\s]+image[^\s]*)/i;
  const match = text.match(regex);
  
  return match ? match[0] : null;
}

export async function generateMetadata({ params: { proposalId } }): Promise<Metadata> {
  if (!proposalId) {
    return defaultMetadata;
  }

  const proposalData = await loadProposalData(proposalId);

  if (!proposalData || proposalData.title === "Error loading proposal") {
    return defaultMetadata;
  }

  // Extract image URL from proposal description if available
  const extractedImageUrl = proposalData.description 
    ? extractFirstImageUrl(proposalData.description)
    : null;
  
  const frameUrl = `${WEBSITE_URL}/p/${proposalId}`;
  // Base opengraph image URL, with extracted image as parameter if available
  let ogImageUrl = `${WEBSITE_URL}/nounspace_og_low.png`;
  
  if (extractedImageUrl) {
    const encodedImageUrl = encodeURIComponent(extractedImageUrl);
    ogImageUrl = `${WEBSITE_URL}/opengraph-image?image=${encodedImageUrl}`;
  }

  const proposalFrame = {
    version: "next",
    imageUrl: ogImageUrl,
    button: {
      title: `View Proposal ${proposalData.id}`,
      action: {
        type: "launch_frame",
        url: frameUrl,
        name: `Proposal ${proposalData.id} on Nounspace`,
        splashImageUrl: `${WEBSITE_URL}/images/nounspace_logo.png`,
        splashBackgroundColor: "#FFFFFF",
      },
    },
  };

  const metadataWithFrame = {
    title: `Proposal: ${proposalData.title} | Nounspace`,
    description: `Proposal by ${proposalData.proposer.id} on Nounspace. Explore the details and discussions around this proposal.`,
    openGraph: {
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `Proposal: ${proposalData.title}`
      }]
    },
    other: {
      "fc:frame": JSON.stringify(proposalFrame),
    },
  };

  return metadataWithFrame;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}