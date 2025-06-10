import React from "react";
import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

export const config = {
  runtime: "edge",
};

interface ProposalImageData {
  id: string;
  title: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorum: number;
}

export default async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const params = searchParams;
  const data: ProposalImageData = {
    id: params.get("id") || "",
    title: params.get("title") || "",
    forVotes: Number(params.get("forVotes") || 0),
    againstVotes: Number(params.get("againstVotes") || 0),
    abstainVotes: Number(params.get("abstainVotes") || 0),
    quorum: Number(params.get("quorum") || 0),
  };
  return new ImageResponse(<ProposalCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const ProposalCard = ({ data }: { data: ProposalImageData }) => {
  const total = data.forVotes + data.againstVotes + data.abstainVotes;
  const forPercent = total ? (data.forVotes / total) * 100 : 0;
  const againstPercent = total ? (data.againstVotes / total) * 100 : 0;
  const abstainPercent = total ? (data.abstainVotes / total) * 100 : 0;
  const quorumPercent = total ? (data.quorum / total) * 100 : 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "white",
        fontFamily: "Arial, sans-serif",
        color: "black",
        gap: "24px",
      }}
    >
      <div style={{ fontSize: "48px", fontWeight: "bold" }}>{
        `Prop ${data.id}: ${data.title}`
      }</div>
      <div style={{ fontSize: "32px", color: "#DD3333" }}>{
        `Against: ${data.againstVotes}`
      }</div>
      <div style={{ fontSize: "32px", color: "#888888" }}>{
        `Abstain: ${data.abstainVotes}`
      }</div>
      <div style={{ fontSize: "32px", color: "#33BB33" }}>{
        `For: ${data.forVotes}`
      }</div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "40px",
          background: "#E5E5E5",
          borderRadius: "8px",
          overflow: "hidden",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${againstPercent}%`,
            background: "#DD3333",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${againstPercent}%`,
            top: 0,
            bottom: 0,
            width: `${abstainPercent}%`,
            background: "#888888",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${againstPercent + abstainPercent}%`,
            top: 0,
            bottom: 0,
            width: `${forPercent}%`,
            background: "#33BB33",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${quorumPercent}%`,
            top: 0,
            bottom: 0,
            width: "4px",
            background: "black",
          }}
        />
      </div>
    </div>
  );
};
