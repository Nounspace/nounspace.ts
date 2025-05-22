import React from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

export const config = {
  runtime: "edge",
};

interface TokenCardData {
  name: string;
  symbol: string;
  imageUrl: string;
  address: string;
  marketCap: string;
  priceChange: string;
}

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | string>,
) {
  if (!req.url) {
    return res.status(404).send("Url not found");
  }

  const params = new URLSearchParams(req.url.split("?")[1]);
  const data: TokenCardData = {
    name: params.get("name") || "",
    symbol: params.get("symbol") || "",
    imageUrl: params.get("imageUrl") || "",
    address: params.get("address") || "",
    marketCap: params.get("marketCap") || "",
    priceChange: params.get("priceChange") || "",
  };

  return new ImageResponse(<TokenCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const TokenCard = ({ data }: { data: TokenCardData }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      padding: "40px",
      display: "flex",
      alignItems: "center",
      background: "white",
      gap: "32px",
      fontFamily: "Arial, sans-serif",
    }}
  >
    {data.imageUrl && (
      <img
        src={data.imageUrl}
        width="160"
        height="160"
        style={{ borderRadius: "80px" }}
      />
    )}
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <span style={{ fontSize: "56px", fontWeight: "bold" }}>{data.name}</span>
      <span style={{ fontSize: "42px", color: "#555" }}>{data.symbol}</span>
      <span style={{ fontSize: "28px" }}>Address: {data.address}</span>
      <span style={{ fontSize: "28px" }}>Market Cap: {data.marketCap}</span>
      <span style={{ fontSize: "28px" }}>24h Change: {data.priceChange}%</span>
    </div>
  </div>
);
