import { WEBSITE_URL } from "@/constants/app";
import { Metadata } from "next";

export type ProposalMetadata = {
  id?: string;
  title?: string;
  forVotes?: string | number;
  againstVotes?: string | number;
  abstainVotes?: string | number;
  quorumVotes?: string | number;
};

export const getProposalMetadataStructure = (
  proposal: ProposalMetadata,
): Metadata => {
  if (!proposal) {
    return {};
  }

  const {
    id,
    title,
    forVotes,
    againstVotes,
    abstainVotes,
    quorumVotes,
  } = proposal;

  const query = new URLSearchParams({
    id: id?.toString() || "",
    title: title || "",
    forVotes: forVotes?.toString() || "0",
    againstVotes: againstVotes?.toString() || "0",
    abstainVotes: abstainVotes?.toString() || "0",
    quorum: quorumVotes?.toString() || "0",
  });

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/proposal?${query.toString()}`;

  const spaceUrl = id ? `${WEBSITE_URL}/p/${id}` : undefined;
  const proposalTitle = title ? `Prop ${id}: ${title}` : "Proposal on Nounspace";

  const metadata: Metadata = {
    title: proposalTitle,
    openGraph: {
      title: proposalTitle,
      url: spaceUrl,
      images: [ogImageUrl],
    },
    twitter: {
      title: proposalTitle,
      images: [ogImageUrl],
      card: "summary_large_image",
    },
  };

  return metadata;
};
