import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { blobId } = req.query;

  if (!blobId || typeof blobId !== "string") {
    return res.status(400).json({ error: "Invalid blobId" });
  }

  const cleanBlobId = blobId.replace(/\.mp4$/, "");
  
  // Get the base URL
  const forwardedProto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers.host || "localhost:3000";
  const baseUrl = `${forwardedProto}://${host}`;
  
  const videoUrl = `${baseUrl}/api/walrus-video/${cleanBlobId}.mp4`;
  const pageUrl = `${baseUrl}/api/farcaster/video/${cleanBlobId}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Walrus Video</title>
  
  <!-- Farcaster Frame meta tags -->
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:video" content="${videoUrl}" />
  <meta property="fc:frame:video:type" content="video/mp4" />
  <meta property="fc:frame:image" content="${baseUrl}/images/nounspace_logo.png" />
  
  <!-- Open Graph meta tags -->
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="Walrus Video" />
  <meta property="og:description" content="Video hosted on Walrus decentralized storage" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:video" content="${videoUrl}" />
  <meta property="og:video:url" content="${videoUrl}" />
  <meta property="og:video:secure_url" content="${videoUrl}" />
  <meta property="og:video:type" content="video/mp4" />
  <meta property="og:video:width" content="1280" />
  <meta property="og:video:height" content="720" />
  
  <!-- Twitter Card meta tags -->
  <meta name="twitter:card" content="player" />
  <meta name="twitter:title" content="Walrus Video" />
  <meta name="twitter:description" content="Video hosted on Walrus decentralized storage" />
  <meta name="twitter:player" content="${videoUrl}" />
  <meta name="twitter:player:width" content="1280" />
  <meta name="twitter:player:height" content="720" />
</head>
<body>
  <video src="${videoUrl}" controls autoplay style="width: 100%; height: 100vh;">
    Your browser does not support the video tag.
  </video>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
