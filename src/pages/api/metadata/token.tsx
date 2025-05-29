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
  price: string;
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
    price: params.get("price") || "",
    priceChange: params.get("priceChange") || "",
  };

  return new ImageResponse(<TokenCard data={data} />, {
    width: 1200,
    height: 630,
  });
}

const TokenCard = ({ data }: { data: TokenCardData }) => {
  const marketCapNumber = Number(data.marketCap);
  const formattedMarketCap = Number.isFinite(marketCapNumber)
    ? `$${marketCapNumber.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : data.marketCap;

  const priceNumber = parseFloat(data.price.replace(/[$,]/g, ""));
  const formattedPrice = Number.isFinite(priceNumber)
    ? `$${priceNumber.toLocaleString(undefined, {
        minimumFractionDigits: priceNumber < 0.01 ? 4 : 2,
        maximumFractionDigits: priceNumber < 0.01 ? 6 : 2,
      })}`
    : data.price;

  const priceChangeNumber = Number(data.priceChange);
  const priceChangeColor = Number.isFinite(priceChangeNumber)
    ? priceChangeNumber >= 0
      ? "green"
      : "red"
    : "white";
  const formattedPriceChange = Number.isFinite(priceChangeNumber)
    ? priceChangeNumber.toFixed(2)
    : data.priceChange;

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
      {data.imageUrl && (
        <img
          src={data.imageUrl}
          width="160"
          height="160"
          style={{ borderRadius: "80px", alignSelf: "center" }}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          paddingLeft: "111px",
        }}
      >
        <span style={{ fontSize: "56px", fontWeight: "bold" }}>{data.name}</span>
        <span style={{ fontSize: "42px", color: "white" }}>{`$${data.symbol}`}</span>
        <span style={{ fontSize: "28px" }}>
          Price: {formattedPrice}{" "}
          <span style={{ color: priceChangeColor }}>
            {formattedPriceChange}%
          </span>
        </span>
        <span style={{ fontSize: "28px" }}>Address: {data.address}</span>
        <span style={{ fontSize: "28px" }}>Market Cap: {formattedMarketCap}</span>
      </div>
    </div>
  );
};
