import React from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

export const config = {
  runtime: "edge",
};

interface CastCardData {
  username: string;
  pfpUrl: string;
  text: string;
  imageUrl?: string;
}

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | string>,
) {
  if (!req.url) {
    return res.status(404).send("Url not found");
  }

  const params = new URLSearchParams(req.url.split("?")[1]);
  const data: CastCardData = {
    username: params.get("username") || "",
    pfpUrl: params.get("pfpUrl") || "",
    text: params.get("text") || "",
    imageUrl: params.get("imageUrl") || undefined,
  };

  return new ImageResponse(<CastCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const CastCard = ({ data }: { data: CastCardData }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        background: "white",
        color: "black",
        fontFamily: "Arial, sans-serif",
        gap: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {data.pfpUrl && (
          <img
            src={data.pfpUrl}
            width="120"
            height="120"
            style={{ borderRadius: "60px" }}
          />
        )}
        <span style={{ fontSize: "48px", fontWeight: "bold" }}>@{data.username}</span>
      </div>
      <span style={{ fontSize: "32px", whiteSpace: "pre-wrap" }}>{data.text}</span>
      {data.imageUrl && (
        <img
          src={data.imageUrl}
          style={{
            width: "100%",
            maxHeight: "320px",
            objectFit: "cover",
            borderRadius: "12px",
          }}
        />
      )}
    </div>
  );
};
