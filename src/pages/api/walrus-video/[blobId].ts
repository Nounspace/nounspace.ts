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

  const cleanBlobId = blobId.replace(/\.(mp4|webm|mov|m4v|ogv|ogg|mkv|avi)$/i, "");
  
  // Validate blob ID format  
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanBlobId)) {
    return res.status(400).json({ error: "Invalid blob ID format" });
  }

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

  // Handle HEAD requests and conditional responses properly
  if (req.method === "HEAD" || upstreamResponse.status === 304) {
    return res.end();
  }

  // Streaming compatível com Web ReadableStream (getReader) e Node async iterable streams
  try {
    const body = upstreamResponse.body as any;

    if (!body) {
      const buffer = await upstreamResponse.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    // Web ReadableStream (browsers / some fetch implementations)
    if (typeof body.getReader === "function") {
      const reader = body.getReader();
      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        streamDone = !!done;
        if (value) res.write(Buffer.from(value));
      }
      return res.end();
    }

    // Node.js readable stream / async iterable (Node 18+ fetch returns a stream with async iterator)
    if (typeof body[Symbol.asyncIterator] === "function") {
      for await (const chunk of body) {
        // chunk can be a Buffer or Uint8Array
        res.write(Buffer.from(chunk));
      }
      return res.end();
    }

    // Fallback: read full buffer
    const buffer = await upstreamResponse.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Error streaming walrus video:", err);
    return res.status(500).end("Error streaming video");
  }
}
