import React from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

export const config = {
  runtime: "edge",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | string>,
) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#10b981",
            color: "white",
            fontSize: "48px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Test Proposal Image
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response("Error", { status: 500 });
  }
}
