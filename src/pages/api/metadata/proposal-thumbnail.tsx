import React from "react";
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
  timeRemaining: string;
}

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const data: ProposalCardData = {
    id: searchParams.get("id") || "Unknown",
    title: searchParams.get("title") || "Unknown Proposal",
    forVotes: searchParams.get("forVotes") || "0",
    againstVotes: searchParams.get("againstVotes") || "0",
    abstainVotes: searchParams.get("abstainVotes") || "0",
    quorumVotes: searchParams.get("quorumVotes") || "100",
    timeRemaining: searchParams.get("timeRemaining") || "",
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

  // Progress bar calculations for Nouns governance
  // Calculate total scale: against votes + quorum (since for votes overlay on quorum)
  const totalScale = againstVotes + quorumVotes;
  const againstPercentage = totalScale > 0 ? (againstVotes / totalScale) * 100 : 0;
  const quorumPercentage = totalScale > 0 ? (quorumVotes / totalScale) * 100 : 0;
  const forPercentage = totalScale > 0 ? (forVotes / totalScale) * 100 : 0;

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
        <span style={{ fontSize: "67px", fontWeight: "900" }}>Prop {data.id}</span>
        <span style={{ fontSize: "50px", fontWeight: "900", color: "white" }}>{data.title}</span>
        <span style={{ fontSize: "34px", fontWeight: "900" }}>
          For: {formatVotes(forVotes)} | Against: {formatVotes(againstVotes)} | Abstain: {formatVotes(abstainVotes)}
        </span>
        <span style={{ fontSize: "29px", fontWeight: "900" }}>Quorum: {formatVotes(quorumVotes)}</span>
        {data.timeRemaining && (
          <span style={{ fontSize: "24px", fontWeight: "700", opacity: 0.9 }}>
            {data.timeRemaining}
          </span>
        )}
      </div>

      {/* Progress bar - Nouns governance style */}
      <div style={{
        width: "70%",
        height: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        position: "relative",
        marginTop: "20px",
        marginLeft: "111px",
      }}>
        {/* Against votes (red) - always on the left */}
        {againstPercentage > 0 && (
          <div style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: `${Math.min(againstPercentage, 100)}%`,
            height: "100%",
            backgroundColor: "#ef4444",
            borderRadius: againstPercentage >= 100 ? "10px" : "10px 0 0 10px",
          }} />
        )}
        
        {/* Quorum bar (grey) - starts after against votes */}
        {quorumPercentage > 0 && (
          <div style={{
            position: "absolute",
            left: `${Math.min(againstPercentage, 100)}%`,
            top: "0",
            width: `${Math.min(quorumPercentage, 100 - againstPercentage)}%`,
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            borderRadius: (againstPercentage + quorumPercentage) >= 100 ? "0 10px 10px 0" : "0",
          }} />
        )}
        
        {/* For votes (green) - overlays on quorum, starts after against votes */}
        {forPercentage > 0 && (
          <div style={{
            position: "absolute",
            left: `${Math.min(againstPercentage, 100)}%`,
            top: "0",
            width: `${Math.min(forPercentage, 100 - againstPercentage)}%`,
            height: "100%",
            backgroundColor: "#10b981",
            borderRadius: (againstPercentage + forPercentage) >= 100 ? "0 10px 10px 0" : "0",
          }} />
        )}
      </div>
    </div>
  );
};
