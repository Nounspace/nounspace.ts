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

  const cleanBlobId = blobId.replace(/\.(mp4|webm|mov|ogg|ogv|mkv)$/, "");

  let upstreamResponse: Response | null = null;
  let lastError: Error | null = null;
  const range = req.headers.range as string | undefined;

  // tenta múltiplos agregadores
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

  // forward headers importantes
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const contentType = upstreamResponse.headers.get("content-type");
  res.setHeader("Content-Type", contentType?.startsWith("video/") ? contentType : "video/mp4");

  const passHeaders = ["content-length", "content-range", "etag", "last-modified", "cache-control"];
  passHeaders.forEach((h) => {
    const v = upstreamResponse!.headers.get(h);
    if (v) res.setHeader(h, v);
  });

  res.status(upstreamResponse.status);

  if (req.method === "HEAD") {
    return res.end();
  }

  if (upstreamResponse.body) {
    const reader = upstreamResponse.body.getReader();
    let done = false;
    while (!done) {
      const { done: isDone, value } = await reader.read();
      done = isDone;
      if (value) res.write(value);
    }
    res.end();
  } else {
    const buffer = await upstreamResponse.arrayBuffer();
    res.send(Buffer.from(buffer));
  }
}
