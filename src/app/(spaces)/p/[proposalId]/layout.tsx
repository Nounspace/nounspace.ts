import { Metadata } from "next/types";
import React from "react";
import { WEBSITE_URL } from "@/constants/app";
import { loadProposalData } from "./utils";
import { defaultFrame } from "@/common/lib/frames/metadata";
import { getProposalMetadataStructure } from "@/common/lib/utils/proposalMetadata";

const defaultMetadata = {
  other: {
    'fc:frame': JSON.stringify(defaultFrame),
  },
};

export async function generateMetadata({ params }): Promise<Metadata> {
  const { proposalId } = await params;
  
  if (!proposalId) {
    return defaultMetadata;
  }

  const proposalData = await loadProposalData(proposalId);

  if (!proposalData || proposalData.title === "Error loading proposal") {
    return defaultMetadata;
  }

  const frameUrl = `${WEBSITE_URL}/p/${proposalId}`;

  const baseMetadata = getProposalMetadataStructure({
    id: proposalData.id,
    title: proposalData.title,
    forVotes: proposalData.forVotes,
    againstVotes: proposalData.againstVotes,
    abstainVotes: proposalData.abstainVotes,
    quorumVotes: proposalData.quorumVotes,
  });

  const ogImageUrl = baseMetadata.openGraph?.images?.[0];

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
    ...baseMetadata,
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