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

  const params = new URLSearchParams(req.url.split("?")[1]);
  const data: ProposalCardData = {
    id: params.get("id") || "",
    title: params.get("title") || "",
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
        background: "purple",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <span style={{ fontSize: "56px", fontWeight: "bold" }}>Prop {data.id}</span>
      <span style={{ fontSize: "32px" }}>{data.title}</span>
      <span style={{ fontSize: "24px" }}>For: {data.forVotes}</span>
    </div>
  );
};
