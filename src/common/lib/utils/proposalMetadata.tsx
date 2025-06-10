import { WEBSITE_URL } from "@/constants/app";
import { merge } from "lodash";
import { Metadata } from "next";

export interface ProposalMetadata {
  id?: string;
  title?: string;
  forVotes?: string;
  againstVotes?: string;
  abstainVotes?: string;
  quorumVotes?: string;
}

export const getProposalMetadataStructure = (
  proposal: ProposalMetadata,
): Metadata => {
  if (!proposal) {
    return {};
  }

  const { id, title, forVotes, againstVotes, abstainVotes, quorumVotes } = proposal;

  const params = new URLSearchParams({
    id: id || "",
    title: title || "",
    forVotes: forVotes || "0",
    againstVotes: againstVotes || "0",
    abstainVotes: abstainVotes || "0",
    quorumVotes: quorumVotes || "0",
  });

  const ogImageUrl = `${WEBSITE_URL}/api/metadata/proposal?${params.toString()}`;

  const spaceUrl = id ? `https://nounspace.com/p/${id}` : undefined;
  const propTitle = title ? `Prop ${id}: ${title}` : `Proposal ${id}`;

  const metadata: Metadata = {
    title: propTitle,
    openGraph: {
      title: propTitle,
      url: spaceUrl,
      images: [ogImageUrl],
    },
    twitter: {
      title: propTitle,
      site: "https://nounspace.com/",
      images: [ogImageUrl],
      card: "summary_large_image",
    },
  };

  const description = `Against: ${againstVotes || 0} | Abstain: ${abstainVotes || 0} | For: ${forVotes || 0}`;
  merge(metadata, {
    description,
    openGraph: { description },
    twitter: { description },
  });

  return metadata;
};
