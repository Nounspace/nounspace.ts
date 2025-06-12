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
  res: NextApiResponse,
) {
  try {
    if (!req.url) {
      return res.status(404).send("Url not found");
    }

    const urlParts = req.url.split("?");
    const queryString = urlParts[1] || "";
    const params = new URLSearchParams(queryString);
    
    console.log("Proposal thumbnail request:", {
      url: req.url,
      queryString,
      id: params.get("id"),
      title: params.get("title"),
    });
    
    const proposalMetadata: ProposalMetadata = {
      id: params.get("id") || "Unknown",
      title: params.get("title") || "Unknown Proposal",
      proposer: params.get("proposer") || "0x0",
      signers: params.get("signers")?.split(",").filter(Boolean) || [],
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
  } catch (error) {
    console.error("Error generating proposal image:", error);
    return res.status(500).send("Error generating image");
  }
}

const ProposalCard = ({ proposalMetadata }: { proposalMetadata: ProposalMetadata }) => {
  const forVotes = parseInt(proposalMetadata.forVotes);
  const againstVotes = parseInt(proposalMetadata.againstVotes);
  const abstainVotes = parseInt(proposalMetadata.abstainVotes);
  const quorumVotes = parseInt(proposalMetadata.quorumVotes);
  
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const forPercentage = totalVotes > 0 ? (forVotes / quorumVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (againstVotes / quorumVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (abstainVotes / quorumVotes) * 100 : 0;

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

  const displayTitle = proposalMetadata.title.length > 60 
    ? proposalMetadata.title.substring(0, 60) + "..." 
    : proposalMetadata.title;

  const getProposerDisplay = () => {
    if (proposalMetadata.signers && proposalMetadata.signers.length > 0) {
      const allSigners = [proposalMetadata.proposer, ...proposalMetadata.signers];
      if (allSigners.length === 1) {
        return formatAddress(allSigners[0]);
      } else if (allSigners.length <= 2) {
        return allSigners.map(formatAddress).join(" & ");
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
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
      }}
    >
      {/* Header with proposal ID and proposer */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "8px" }}>
          Prop {proposalMetadata.id}
        </div>
        <div style={{ fontSize: "18px", opacity: 0.9 }}>
          by {formatAddress(proposalMetadata.proposer)}
        </div>
        {proposalMetadata.timeRemaining && (
          <div style={{ fontSize: "14px", marginTop: "8px", opacity: 0.8 }}>
            {proposalMetadata.timeRemaining}
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ 
        fontSize: "24px", 
        fontWeight: "600", 
        marginBottom: "30px", 
        lineHeight: 1.3,
        minHeight: "60px"
      }}>
        {displayTitle}
      </div>

      {/* Vote counts */}
      <div style={{ display: "flex", gap: "30px", marginBottom: "25px", fontSize: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#10b981", borderRadius: "50%" }} />
          <span>{formatVotes(forVotes)} For</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#fbbf24", borderRadius: "50%" }} />
          <span>{formatVotes(abstainVotes)} Abstain</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#ef4444", borderRadius: "50%" }} />
          <span>{formatVotes(againstVotes)} Against</span>
        </div>
      </div>

      {/* Quorum info */}
      <div style={{ fontSize: "14px", marginBottom: "10px", opacity: 0.9 }}>
        Voting Progress - Quorum: {formatVotes(quorumVotes)}
      </div>

      {/* Progress bar */}
      <div style={{
        width: "100%",
        height: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: "10px",
        marginBottom: "40px",
        display: "flex",
      }}>
        <div style={{
          width: `${Math.min(forPercentage, 100)}%`,
          height: "100%",
          backgroundColor: "#10b981",
          borderRadius: "10px 0 0 10px",
        }} />
        <div style={{
          width: `${Math.min(abstainPercentage, 100 - forPercentage)}%`,
          height: "100%",
          backgroundColor: "#fbbf24",
        }} />
        <div style={{
          width: `${Math.min(againstPercentage, 100 - forPercentage - abstainPercentage)}%`,
          height: "100%",
          backgroundColor: "#ef4444",
          borderRadius: againstPercentage + forPercentage + abstainPercentage >= 100 ? "0 10px 10px 0" : "0",
        }} />
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: "auto", 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "14px"
      }}>
        <div style={{ fontWeight: "600" }}>Nounspace</div>
        <div style={{ opacity: 0.7 }}>View proposal details and vote</div>
      </div>
    </div>
  );
};
