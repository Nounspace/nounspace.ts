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

export async function generateMetadata({ params: { proposalId } }): Promise<Metadata> {
  if (!proposalId) {
    return defaultMetadata;
  }

  const proposalData = await loadProposalData(proposalId);

  if (!proposalData || proposalData.title === "Error loading proposal") {
    return defaultMetadata;
  }
  
  const frameUrl = `${WEBSITE_URL}/p/${proposalId}`;
  
  // Use new direct path to OG image with proposalId parameter
  const ogImageUrl = `${WEBSITE_URL}/og-image/proposal/${proposalId}/opengraph-image`;

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