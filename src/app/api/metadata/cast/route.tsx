import React from "react";
import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

export const runtime = "edge";

interface CastCardData {
  username: string;
  displayName: string;
  pfpUrl: string;
  text: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const data: CastCardData = {
    username: searchParams.get("username") || "",
    displayName: searchParams.get("displayName") || "",
    pfpUrl: searchParams.get("pfpUrl") || "",
    text: searchParams.get("text") || "",
  };

  return new ImageResponse(<CastCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const CastCard = ({ data }: { data: CastCardData }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      padding: "40px",
      display: "flex",
      flexDirection: "column",
      background: "white",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      {data.pfpUrl && (
        <img
          src={data.pfpUrl}
          width="120"
          height="120"
          style={{ borderRadius: "60px" }}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "48px", fontWeight: "bold" }}>{data.displayName}</span>
        <span style={{ fontSize: "36px", color: "#555" }}>@{data.username}</span>
      </div>
    </div>
    <p
      style={{
        fontSize: "40px",
        marginTop: "40px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {data.text}
    </p>
  </div>
);
