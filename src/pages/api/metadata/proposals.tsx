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
    id: params.get("id") || "",
    title: params.get("title") || "",
    proposer: params.get("proposer") || "",
    signers: params.get("signers")?.split(",") || [],
    forVotes: params.get("forVotes") || "0",
    againstVotes: params.get("againstVotes") || "0",
    abstainVotes: params.get("abstainVotes") || "0",
    quorumVotes: params.get("quorumVotes") || "0",
    timeRemaining: params.get("timeRemaining") || "",
  };

  return new ImageResponse(<ProposalCard proposalMetadata={proposalMetadata} />, {
    width: 1200,
    height: 630,
  });
}

const ProposalCard = ({ proposalMetadata }: { proposalMetadata: ProposalMetadata }) => {
  const forVotes = parseInt(proposalMetadata.forVotes);
  const againstVotes = parseInt(proposalMetadata.againstVotes);
  const abstainVotes = parseInt(proposalMetadata.abstainVotes);
  const quorumVotes = parseInt(proposalMetadata.quorumVotes);
  
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const quorumProgress = totalVotes > 0 ? Math.min((totalVotes / quorumVotes) * 100, 100) : 0;
  
  // Calculate proportions for the voting bar
  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * quorumProgress : 0;
  const abstainPercentage = totalVotes > 0 ? (abstainVotes / totalVotes) * quorumProgress : 0;
  const againstPercentage = totalVotes > 0 ? (againstVotes / totalVotes) * quorumProgress : 0;

  const formatVotes = (votes: number) => {
    if (votes >= 1000000) return `${(votes / 1000000).toFixed(1)}M`;
    if (votes >= 1000) return `${(votes / 1000).toFixed(1)}K`;
    return votes.toString();
  };

  const formatAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const getProposerDisplay = () => {
    if (proposalMetadata.signers && proposalMetadata.signers.length > 0) {
      const allSigners = [proposalMetadata.proposer, ...proposalMetadata.signers];
      if (allSigners.length === 1) {
        return formatAddress(allSigners[0]);
      } else if (allSigners.length <= 3) {
        return allSigners.map(formatAddress).join(", ");
      } else {
        return `${formatAddress(allSigners[0])} +${allSigners.length - 1} others`;
      }
    }
    return formatAddress(proposalMetadata.proposer);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "30px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Prop {proposalMetadata.id}
          </div>
          <div
            style={{
              fontSize: "20px",
              opacity: 0.9,
            }}
          >
            by {getProposerDisplay()}
          </div>
        </div>
        {proposalMetadata.timeRemaining && (
          <div
            style={{
              fontSize: "18px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: "8px 16px",
              borderRadius: "8px",
            }}
          >
            {proposalMetadata.timeRemaining}
          </div>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "28px",
          fontWeight: "600",
          marginBottom: "40px",
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {proposalMetadata.title}
      </div>

      {/* Voting Statistics */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          marginBottom: "30px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
            }}
          />
          <span style={{ fontSize: "18px", fontWeight: "600" }}>
            {formatVotes(forVotes)} For
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "#fbbf24",
              borderRadius: "50%",
            }}
          />
          <span style={{ fontSize: "18px", fontWeight: "600" }}>
            {formatVotes(abstainVotes)} Abstain
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
            }}
          />
          <span style={{ fontSize: "18px", fontWeight: "600" }}>
            {formatVotes(againstVotes)} Against
          </span>
        </div>
      </div>

      {/* Voting Progress Bar */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: "500" }}>
            Voting Progress
          </span>
          <span style={{ fontSize: "16px", opacity: 0.9 }}>
            Quorum: {formatVotes(quorumVotes)}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "24px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Against votes (bottom layer) */}
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "0",
              height: "100%",
              width: `${againstPercentage}%`,
              backgroundColor: "#ef4444",
            }}
          />
          {/* Abstain votes (middle layer) */}
          <div
            style={{
              position: "absolute",
              left: `${againstPercentage}%`,
              top: "0",
              height: "100%",
              width: `${abstainPercentage}%`,
              backgroundColor: "#fbbf24",
            }}
          />
          {/* For votes (top layer) */}
          <div
            style={{
              position: "absolute",
              left: `${againstPercentage + abstainPercentage}%`,
              top: "0",
              height: "100%",
              width: `${forPercentage}%`,
              backgroundColor: "#10b981",
            }}
          />
        </div>
      </div>

      {/* Nounspace Branding */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: "600", opacity: 0.9 }}>
          Nounspace
        </div>
        <div style={{ fontSize: "14px", opacity: 0.7 }}>
          View proposal details and vote
        </div>
      </div>
    </div>
  );
};
