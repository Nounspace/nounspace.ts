import React from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

export const config = {
  runtime: "edge",
};

interface ProposalMetadata {
  id: string;
  title: string;
  proposer: string;
  signers?: string[];
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  quorumVotes: string;
  timeRemaining?: string;
}

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | string>,
) {
  if (!req.url) {
    return res.status(404).send("Url not found");
  }

  const params = new URLSearchParams(req.url.split("?")[1]);
  const proposalMetadata: ProposalMetadata = {
    id: params.get("id") || "Unknown",
    title: params.get("title") || "Unknown Proposal",
    proposer: params.get("proposer") || "0x0",
    forVotes: params.get("forVotes") || "0",
    againstVotes: params.get("againstVotes") || "0",
    abstainVotes: params.get("abstainVotes") || "0",
    quorumVotes: params.get("quorumVotes") || "100",
    timeRemaining: params.get("timeRemaining") || "",
  };

  return new ImageResponse(<ProposalCard proposalMetadata={proposalMetadata} />, {
    width: 1200,
    height: 630,
  });
}

const ProposalCard = ({ proposalMetadata }: { proposalMetadata: ProposalMetadata }) => {
  const forVotes = Number(proposalMetadata.forVotes) || 0;
  const againstVotes = Number(proposalMetadata.againstVotes) || 0;
  const abstainVotes = Number(proposalMetadata.abstainVotes) || 0;
  const quorumVotes = Number(proposalMetadata.quorumVotes) || 0;
  
  const formatVotes = (votes: number) => {
    if (isNaN(votes) || !isFinite(votes)) return "0";
    const num = Math.abs(votes);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const formatAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const displayTitle = proposalMetadata.title.length > 60 
    ? proposalMetadata.title.substring(0, 60) + "..." 
    : proposalMetadata.title;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
      }}
    >
      <div style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}>
        Prop {proposalMetadata.id}
      </div>
      <div style={{ fontSize: "32px", marginBottom: "40px" }}>
        {displayTitle}
      </div>
      <div style={{ fontSize: "24px", marginBottom: "20px" }}>
        by {formatAddress(proposalMetadata.proposer)}
      </div>
      <div style={{ fontSize: "20px", marginBottom: "40px" }}>
        For: {formatVotes(forVotes)} | Against: {formatVotes(againstVotes)} | Abstain: {formatVotes(abstainVotes)}
      </div>
      {proposalMetadata.timeRemaining && (
        <div style={{ fontSize: "18px", marginBottom: "20px" }}>
          {proposalMetadata.timeRemaining}
        </div>
      )}
    </div>
  );
};
