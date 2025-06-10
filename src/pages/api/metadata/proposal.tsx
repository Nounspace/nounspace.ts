import React from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

export const config = {
  runtime: "edge",
};

interface ProposalCardData {
  id: string;
  title: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorumVotes: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | string>,
) {
  if (!req.url) {
    return res.status(404).send("Url not found");
  }

  const params = new URLSearchParams(req.url?.split("?")[1] || "");
  const data: ProposalCardData = {
    id: params.get("id") || "",
    title: params.get("title") || "",
    forVotes: Number(params.get("forVotes") || "0"),
    againstVotes: Number(params.get("againstVotes") || "0"),
    abstainVotes: Number(params.get("abstainVotes") || "0"),
    quorumVotes: Number(params.get("quorumVotes") || "0"),
  };

  return new ImageResponse(<ProposalCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const ProposalCard = ({ data }: { data: ProposalCardData }) => {
  const totalVotes = data.forVotes + data.againstVotes + data.abstainVotes;
  const maxVotes = Math.max(totalVotes, data.quorumVotes, 1);
  const againstPct = (data.againstVotes / maxVotes) * 100;
  const abstainPct = (data.abstainVotes / maxVotes) * 100;
  const forPct = (data.forVotes / maxVotes) * 100;
  const quorumPct = (data.quorumVotes / maxVotes) * 100;

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
        gap: "24px",
      }}
    >
      <div style={{ fontSize: "48px", fontWeight: "bold" }}>
        Prop {data.id}: {data.title}
      </div>
      <div style={{ display: "flex", gap: "20px", fontSize: "32px" }}>
        <span style={{ color: "#DD3333" }}>{data.againstVotes} Against</span>
        <span style={{ color: "#777777" }}>{data.abstainVotes} Abstain</span>
        <span style={{ color: "#33BB33" }}>{data.forVotes} For</span>
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "40px",
          background: "#E5E5E5",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${againstPct}%`,
            background: "#DD3333",
            height: "100%",
            display: "inline-block",
          }}
        />
        <div
          style={{
            width: `${abstainPct}%`,
            background: "#777777",
            height: "100%",
            display: "inline-block",
          }}
        />
        <div
          style={{
            width: `${forPct}%`,
            background: "#33BB33",
            height: "100%",
            display: "inline-block",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${quorumPct}%`,
            top: 0,
            bottom: 0,
            width: "4px",
            background: "#000000",
          }}
        />
      </div>
      <div style={{ fontSize: "24px" }}>Quorum: {data.quorumVotes} votes</div>
    </div>
  );
};
