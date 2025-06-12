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
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
  quorumVotes: string;
}

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | string>,
) {
  if (!req.url) {
    return res.status(404).send("Url not found");
  }

  const urlParts = req.url.split("?");
  const params = new URLSearchParams(urlParts[1] || "");
  const data: ProposalCardData = {
    id: params.get("id") || "Unknown",
    title: params.get("title") || "Unknown Proposal",
    proposer: params.get("proposer") || "0x0",
    forVotes: params.get("forVotes") || "0",
    againstVotes: params.get("againstVotes") || "0",
    abstainVotes: params.get("abstainVotes") || "0",
    quorumVotes: params.get("quorumVotes") || "100",
  };

  return new ImageResponse(<ProposalCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const ProposalCard = ({ data }: { data: ProposalCardData }) => {
  // Vote count formatting
  const forVotes = Number(data.forVotes) || 0;
  const againstVotes = Number(data.againstVotes) || 0;
  const abstainVotes = Number(data.abstainVotes) || 0;
  const quorumVotes = Number(data.quorumVotes) || 1;

  const formatVotes = (votes: number) => {
    if (isNaN(votes) || !isFinite(votes)) return "0";
    const num = Math.abs(votes);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const formatAddress = (address: string) => {
    if (!address || address === "0x0") return "Unknown";
    if (address.length > 10) {
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    return address;
  };

  // Progress bar calculations
  const forPercentage = Math.min((forVotes / quorumVotes) * 100, 100);
  const againstPercentage = Math.min((againstVotes / quorumVotes) * 100, 100);
  const abstainPercentage = Math.min((abstainVotes / quorumVotes) * 100, 100);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        gap: "32px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingLeft: "111px",
        }}
      >
        {/* Proposal ID - 20% larger and bold */}
        <span style={{ fontSize: "67px", fontWeight: "bold" }}>Prop {data.id}</span>
        
        {/* Proposal Title - 20% larger and bold */}
        <span style={{ fontSize: "50px", fontWeight: "bold", color: "white" }}>{data.title}</span>
        
        {/* Proposer - 20% larger and bold */}
        <span style={{ fontSize: "34px", fontWeight: "bold", opacity: 0.9 }}>
          by {formatAddress(data.proposer)}
        </span>
        
        {/* Vote counts with colored text - 20% larger and bold */}
        <span style={{ fontSize: "34px", fontWeight: "bold" }}>
          <span style={{ color: "#10b981" }}>For: {formatVotes(forVotes)}</span> | 
          <span style={{ color: "#ef4444" }}> Against: {formatVotes(againstVotes)}</span> | 
          <span style={{ color: "#fbbf24" }}> Abstain: {formatVotes(abstainVotes)}</span>
        </span>
        
        {/* Quorum - 20% larger and bold */}
        <span style={{ fontSize: "29px", fontWeight: "bold" }}>Quorum: {formatVotes(quorumVotes)}</span>
      </div>

      {/* Progress bar - 30% smaller width */}
      <div style={{
        width: "70%",
        height: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: "10px",
        display: "flex",
        marginTop: "20px",
      }}>
        <div style={{
          width: `${Math.max(0, Math.min(forPercentage, 100))}%`,
          height: "100%",
          backgroundColor: "#10b981",
          borderRadius: forPercentage >= 100 ? "10px" : "10px 0 0 10px",
        }} />
        <div style={{
          width: `${Math.max(0, Math.min(abstainPercentage, 100 - forPercentage))}%`,
          height: "100%",
          backgroundColor: "#fbbf24",
        }} />
        <div style={{
          width: `${Math.max(0, Math.min(againstPercentage, 100 - forPercentage - abstainPercentage))}%`,
          height: "100%",
          backgroundColor: "#ef4444",
          borderRadius: (forPercentage + abstainPercentage + againstPercentage) >= 100 ? "0 10px 10px 0" : "0",
        }} />
      </div>
    </div>
  );
};
