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
  };

  return new ImageResponse(<ProposalCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const ProposalCard = ({ data }: { data: ProposalCardData }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        background: "black",
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
        <span style={{ fontSize: "28px" }}>For: {data.forVotes}</span>
      </div>
    </div>
  );
};
