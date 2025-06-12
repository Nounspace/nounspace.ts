import React from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

export const config = {
  runtime: "edge",
};

interface ProposalCardData {
  id: string;
  title: string;
  proposer: string;
  signers?: string;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  quorumVotes: string;
  timeRemaining: string;
}

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | string>,
) {
  if (!req.url) {
    return res.status(404).send("Url not found");
  }

  const params = new URLSearchParams(req.url.split("?")[1]);
  const data: ProposalCardData = {
    id: params.get("id") || "",
    title: params.get("title") || "",
    proposer: params.get("proposer") || "",
    signers: params.get("signers") || "",
    forVotes: params.get("forVotes") || "",
    againstVotes: params.get("againstVotes") || "",
    abstainVotes: params.get("abstainVotes") || "",
    quorumVotes: params.get("quorumVotes") || "",
    timeRemaining: params.get("timeRemaining") || "",
  };

  return new ImageResponse(<ProposalCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const ProposalCard = ({ data }: { data: ProposalCardData }) => {
  // Safe number parsing
  const forVotes = Number(data.forVotes) || 0;
  const againstVotes = Number(data.againstVotes) || 0;
  const abstainVotes = Number(data.abstainVotes) || 0;
  const quorumVotes = Number(data.quorumVotes) || 1;
  
  // Calculate percentages for the progress bar (based on quorum)
  const forPercentage = Math.min((forVotes / quorumVotes) * 100, 100);
  const againstPercentage = Math.min((againstVotes / quorumVotes) * 100, 100);
  const abstainPercentage = Math.min((abstainVotes / quorumVotes) * 100, 100);
  const totalVotePercentage = forPercentage + againstPercentage + abstainPercentage;

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

  const displayTitle = data.title.length > 60 
    ? data.title.substring(0, 60) + "..." 
    : data.title;

  const getProposerDisplay = () => {
    if (data.signers && data.signers.trim()) {
      try {
        const signersList = data.signers.split(",").map(s => s.trim()).filter(Boolean);
        const allSigners = Array.from(new Set([data.proposer, ...signersList]));
        
        if (allSigners.length <= 2) {
          return allSigners.map(formatAddress).join(" & ");
        } else {
          return `${formatAddress(allSigners[0])} +${allSigners.length - 1} others`;
        }
      } catch {
        return formatAddress(data.proposer);
      }
    }
    return formatAddress(data.proposer);
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
          Prop {data.id}
        </div>
        <div style={{ fontSize: "18px", opacity: 0.9 }}>
          by {getProposerDisplay()}
        </div>
        {data.timeRemaining && (
          <div style={{ fontSize: "14px", marginTop: "8px", opacity: 0.8 }}>
            {data.timeRemaining}
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

      {/* Progress bar with quorum background */}
      <div style={{
        width: "100%",
        height: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.3)", // Grey quorum background
        borderRadius: "10px",
        marginBottom: "40px",
        display: "flex",
        position: "relative",
      }}>
        {/* For votes (green) */}
        <div style={{
          width: `${Math.max(0, Math.min(forPercentage, 100))}%`,
          height: "100%",
          backgroundColor: "#10b981",
          borderRadius: forPercentage >= 100 ? "10px" : "10px 0 0 10px",
        }} />
        {/* Abstain votes (yellow) */}
        <div style={{
          width: `${Math.max(0, Math.min(abstainPercentage, 100 - forPercentage))}%`,
          height: "100%",
          backgroundColor: "#fbbf24",
        }} />
        {/* Against votes (red) */}
        <div style={{
          width: `${Math.max(0, Math.min(againstPercentage, 100 - forPercentage - abstainPercentage))}%`,
          height: "100%",
          backgroundColor: "#ef4444",
          borderRadius: totalVotePercentage >= 100 ? "0 10px 10px 0" : "0",
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
