// pages/api/walrus/video/[blobId].ts
import { NextApiRequest, NextApiResponse } from "next";

const aggregators = [
  "https://aggregator.walrus-testnet.walrus.space",
  "https://walrus-testnet-aggregator.nodes.guru",
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { blobId } = req.query;

  if (!blobId || typeof blobId !== "string") {
    return res.status(400).json({ error: "Invalid blobId" });
  }

  // Handle preflight CORS requests quickly
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range,Accept,Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range,Content-Length,ETag,Last-Modified,Cache-Control");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    // preflight
    return res.status(204).end();
  }

  // Do not remove the extension from blobId, send as received in the query
  const cleanBlobId = blobId;
  
  // Validate blob ID format (accepts letters, numbers, underscore, hyphen, dot, and optional video extension)
  if (!/^[a-zA-Z0-9_.-]+(\.(mp4|webm|mov|m4v|ogv|ogg|mkv|avi))?$/i.test(cleanBlobId)) {
    return res.status(400).json({ error: "Invalid blob ID format" });
  }

  let upstreamResponse: Response | null = null;
  let lastError: Error | null = null;
  const range = req.headers.range as string | undefined;

  // Try multiple aggregators
  for (const aggregator of aggregators) {
    try {
      const url = `${aggregator}/v1/blobs/${cleanBlobId}`;
      const headers: HeadersInit = {};
      if (range) headers["Range"] = range;

      const response = await fetch(url, { headers });

      if (response.ok || response.status === 206) {
        upstreamResponse = response;
        break;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  if (!upstreamResponse) {
    return res.status(404).json({
      error: "Video not found",
      details: lastError?.message || "All aggregators failed",
    });
  }

  // forward important headers (overwrite some defaults)
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Disposition", "inline; filename=video.mp4");

  const contentType = upstreamResponse.headers.get("content-type");
  res.setHeader("Content-Type", contentType?.startsWith("video/") ? contentType : "video/mp4");

  const passHeaders = ["content-length", "content-range", "etag", "last-modified", "cache-control"];
  passHeaders.forEach((h) => {
    const v = upstreamResponse!.headers.get(h);
    if (v) res.setHeader(h, v);
  });

  // Suporte ao Range: responde com status 206 se Range solicitado
  if (range && upstreamResponse.status === 206) {
    res.status(206);
  } else {
    res.status(upstreamResponse.status);
  }

  if (req.method === "HEAD" || upstreamResponse.status === 304) {
    return res.end();
  }

  try {
    const buffer = await upstreamResponse.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Error sending walrus video as buffer:", err);
    return res.status(500).end("Error sending video");
  }
}
