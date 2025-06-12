import React from "react";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

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

export default async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Directly extract parameters without complex processing to avoid hangs
    const proposalMetadata: ProposalMetadata = {
      id: searchParams.get("id") || "Unknown",
      title: searchParams.get("title") || "Unknown Proposal",
      proposer: searchParams.get("proposer") || "0x0",
      signers: (() => {
        const raw = searchParams.get("signers");
        if (!raw) return [];
        try {
          return decodeURIComponent(raw)
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        } catch {
          return [];
        }
      })(),
      forVotes: searchParams.get("forVotes") || "0",
      againstVotes: searchParams.get("againstVotes") || "0",
      abstainVotes: searchParams.get("abstainVotes") || "0",
      quorumVotes: searchParams.get("quorumVotes") || "100",
      timeRemaining: searchParams.get("timeRemaining") || "",
    };

    // Add timeout protection around the ImageResponse creation
    const imagePromise = new Promise<Response>((resolve) => {
      try {
        const response = new ImageResponse(<ProposalCard proposalMetadata={proposalMetadata} />, {
          width: 1200,
          height: 630,
        });
        resolve(response);
      } catch (err) {
        console.error("Error in ImageResponse creation:", err);
        resolve(new ImageResponse(
          (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ef4444",
              color: "white",
              fontSize: "24px",
              fontFamily: "Arial, sans-serif",
            }}>
              Error: {String(err).substring(0, 100)}
            </div>
          ),
          { width: 1200, height: 630 }
        ));
      }
    });

    // Timeout after 25 seconds (Vercel edge function limit is 30s)
    const timeoutPromise = new Promise<Response>((resolve) => {
      setTimeout(() => {
        resolve(new ImageResponse(
          (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fbbf24",
              color: "white",
              fontSize: "24px",
              fontFamily: "Arial, sans-serif",
            }}>
              Timeout generating thumbnail
            </div>
          ),
          { width: 1200, height: 630 }
        ));
      }, 25000);
    });

    return await Promise.race([imagePromise, timeoutPromise]);

  } catch (error) {
    console.error("Error generating proposal image:", error);
    
    // Return error image
    return new ImageResponse(
      (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ef4444",
          color: "white",
          fontSize: "20px",
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          textAlign: "center",
        }}>
          Error: {String(error).substring(0, 200)}
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}

const ProposalCard = ({ proposalMetadata }: { proposalMetadata: ProposalMetadata }) => {
  // Safe number parsing with NaN protection
  const forVotes = Number(proposalMetadata.forVotes) || 0;
  const againstVotes = Number(proposalMetadata.againstVotes) || 0;
  const abstainVotes = Number(proposalMetadata.abstainVotes) || 0;
  const quorumVotes = Number(proposalMetadata.quorumVotes) || 0;
  
  const totalVotes = forVotes + againstVotes + abstainVotes;
  
  // Safe division with zero protection
  const forPercentage = (quorumVotes > 0 && totalVotes > 0) ? Math.min((forVotes / quorumVotes) * 100, 100) : 0;
  const againstPercentage = (quorumVotes > 0 && totalVotes > 0) ? Math.min((againstVotes / quorumVotes) * 100, 100) : 0;
  const abstainPercentage = (quorumVotes > 0 && totalVotes > 0) ? Math.min((abstainVotes / quorumVotes) * 100, 100) : 0;

  const formatVotes = (votes: number) => {
    // Check for NaN and invalid numbers
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

  const getProposerDisplay = () => {
    try {
      if (proposalMetadata.signers && proposalMetadata.signers.length > 0) {
        // De-duplicate addresses in case proposer is also in signers
        const allSigners = Array.from(
          new Set([proposalMetadata.proposer, ...proposalMetadata.signers])
        );
        if (allSigners.length === 1) {
          return formatAddress(allSigners[0]);
        } else if (allSigners.length <= 2) {
          return allSigners.map(formatAddress).join(" & ");
        } else {
          return `${formatAddress(allSigners[0])} +${allSigners.length - 1} others`;
        }
      }
      return formatAddress(proposalMetadata.proposer);
    } catch (err) {
      return formatAddress(proposalMetadata.proposer);
    }
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
          by {getProposerDisplay()}
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
          width: `${Math.min(Math.max(0, forPercentage), 100)}%`,
          height: "100%",
          backgroundColor: "#10b981",
          borderRadius: "10px 0 0 10px",
        }} />
        <div style={{
          width: `${Math.min(Math.max(0, abstainPercentage), Math.max(0, 100 - forPercentage))}%`,
          height: "100%",
          backgroundColor: "#fbbf24",
        }} />
        <div style={{
          width: `${Math.min(Math.max(0, againstPercentage), Math.max(0, 100 - forPercentage - abstainPercentage))}%`,
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
