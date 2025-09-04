import React from "react";

import { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

// Convert to Node.js runtime to avoid 4MB edge bundle size limit
// export const config = {
//   runtime: "edge",
// };

interface UserMetadata {
  username: string;
  displayName: string;
  pfpUrl: string;
  bio: string;
}

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse | string>,
) {
  if (!req.url) {
    return res.status(404).send("Url not found");
  }

  const params = new URLSearchParams(req.url.split("?")[1]);
  const userMetadata: UserMetadata = {
    username: params.get("username") || "",
    displayName: params.get("displayName") || "",
    pfpUrl: params.get("pfpUrl") || "",
    bio: params.get("bio") || "",
  };

  return new ImageResponse(<ProfileCard userMetadata={userMetadata} />, {
    width: 1200,
    height: 630,
  });
}

const ProfileCard = ({ userMetadata }: { userMetadata: UserMetadata }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        gap: "0px",
      }}
    >
      <img
        src={userMetadata.pfpUrl}
        width={"180px"}
        height={"180px"}
        style={{ borderRadius: "300px" }}
      />
      <p
        style={{
          fontSize: "64px",
          fontWeight: "bold",
        }}
      >
        @{userMetadata.username}
      </p>
      <div
        style={{
          fontSize: "22px",
          display: "flex",
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        {userMetadata.bio}
      </div>
    </div>
  );
};
