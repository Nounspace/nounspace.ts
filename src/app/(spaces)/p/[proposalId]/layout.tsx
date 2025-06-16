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

export async function generateMetadata({ params }: { params: { proposalId?: string } }): Promise<Metadata> {
  const { proposalId } = params;
  
  if (!proposalId) {
    return defaultMetadata;
  }

  const proposalData = await loadProposalData(proposalId);

  if (!proposalData || proposalData.title === "Error loading proposal") {
    return defaultMetadata;
  }

  const frameUrl = `${WEBSITE_URL}/p/${proposalId}`;

  const proposalFrame = {
    version: "next",
    imageUrl: `${WEBSITE_URL}/images/nounspace_og_low.png`,
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
    other: {
      "fc:frame": JSON.stringify(proposalFrame),
    },
  };

  return metadataWithFrame;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}