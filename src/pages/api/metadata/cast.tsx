import React from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";
import { WEBSITE_URL } from "@/constants/app";

export const config = {
  runtime: "edge",
};

interface CastCardData {
  username: string;
  displayName: string;
  pfpUrl: string;
  text: string;
  imageUrl?: string;
  timestamp?: number | string;
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
    displayName: params.get("displayName") || "",
    pfpUrl: params.get("pfpUrl") || "",
    text: params.get("text") || "",
    imageUrl: params.get("imageUrl") || undefined,
    timestamp: params.get("timestamp") || undefined,
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
        data.text ? (
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
          <img
            src={data.imageUrl}
            style={{
              width: "60%",
              maxHeight: "320px",
              objectFit: "cover",
              borderRadius: "12px",
              alignSelf: "flex-start",
            }}
          />
        )
      ) : (
        <span style={{ fontSize: "32px", whiteSpace: "pre-wrap" }}>{data.text}</span>
      )}
    </div>
  );
};
