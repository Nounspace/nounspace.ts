import React from "react";
import { ImageResponse } from "next/og";
import { WEBSITE_URL } from "@/constants/app";

export const runtime = "edge";

interface CastCardData {
  username: string;
  displayName: string;
  pfpUrl: string;
  text: string;
  imageUrl?: string;
  timestamp?: number | string;
}

const safeUrl = (raw: string | null): string | undefined => {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (trimmed.includes(" ")) return undefined;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? trimmed : undefined;
  } catch {
    return undefined;
  }
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data: CastCardData = {
    username: searchParams.get("username") || "",
    displayName: searchParams.get("displayName") || "",
    pfpUrl: safeUrl(searchParams.get("pfpUrl")) || "",
    text: searchParams.get("text") || "",
    imageUrl: safeUrl(searchParams.get("imageUrl")),
    timestamp: searchParams.get("timestamp") || undefined,
  };

  return new ImageResponse(<CastCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const CastCard = ({ data }: { data: CastCardData }) => {
  const dateString = data.timestamp
    ? new Date(
        typeof data.timestamp === "string"
          ? data.timestamp
          : data.timestamp.toString().length === 10
            ? data.timestamp * 1000
            : data.timestamp,
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "60px",
        display: "flex",
        flexDirection: "column",
        background: "white",
        color: "black",
        fontFamily: "Arial, sans-serif",
        gap: "24px",
        position: "relative",
      }}
    >
      <img
        src={`${WEBSITE_URL}/images/logo.png`}
        width="120"
        height="120"
        style={{ position: "absolute", top: "40px", right: "40px", objectFit: "contain" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {data.pfpUrl && (
          <img
            src={data.pfpUrl}
            width="120"
            height="120"
            style={{ borderRadius: "60px" }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.displayName && (
            <span style={{ fontSize: "48px", fontWeight: "bold" }}>
              {data.displayName}
            </span>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "32px",
              color: "#666",
            }}
          >
            <span>@{data.username}</span>
            {dateString && (
              <span>{`\u2022 ${dateString}`}</span>
            )}
          </div>
        </div>
      </div>
      {data.imageUrl ? (
        <div style={{ display: "flex", gap: "24px" }}>
          <span style={{ fontSize: "32px", whiteSpace: "pre-wrap", flex: 1 }}>
            {data.text}
          </span>
          <img
            src={data.imageUrl}
            style={{
              width: "40%",
              maxHeight: "320px",
              objectFit: "cover",
              borderRadius: "12px",
            }}
          />
        </div>
      ) : (
        <span style={{ fontSize: "32px", whiteSpace: "pre-wrap" }}>{data.text}</span>
      )}
    </div>
  );
};

