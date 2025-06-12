import React from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

export const config = {
  runtime: "edge",
};

interface ProposalCardData {
  id: string;
  title: string;
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
        <span style={{ fontSize: "56px", fontWeight: "bold" }}>Prop {data.id}</span>
        <span style={{ fontSize: "42px", color: "white" }}>{data.title}</span>
        <span style={{ fontSize: "28px" }}>
          For: {formatVotes(forVotes)} | Against: {formatVotes(againstVotes)} | Abstain: {formatVotes(abstainVotes)}
        </span>
        <span style={{ fontSize: "24px" }}>Quorum: {formatVotes(quorumVotes)}</span>
      </div>

      {/* Progress bar */}
      <div style={{
        width: "100%",
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
