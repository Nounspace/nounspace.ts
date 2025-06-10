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

  const queryParams = new URLSearchParams({
    id: proposalData.id,
    title: proposalData.title,
    forVotes: proposalData.forVotes || "0",
    againstVotes: proposalData.againstVotes || "0",
    abstainVotes: proposalData.abstainVotes || "0",
    quorum: proposalData.quorumVotes || "0",
  });

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/proposal?${queryParams.toString()}`;

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

  const baseMetadata = getProposalMetadataStructure({
    id: proposalData.id,
    title: proposalData.title,
    proposerId: proposalData.proposer.id,
    forVotes: proposalData.forVotes,
    againstVotes: proposalData.againstVotes,
    abstainVotes: proposalData.abstainVotes,
    quorumVotes: proposalData.quorumVotes,
  });

  const metadataWithFrame = {
    ...baseMetadata,
    other: {
      "fc:frame": JSON.stringify(proposalFrame),
    },
  };

  return metadataWithFrame;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

