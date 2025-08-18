import React from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";

interface WalrusVideoPageProps {
  blobId: string;
  videoUrl: string;
  baseUrl: string;
}

export default function WalrusVideoPage({ blobId, videoUrl, baseUrl }: WalrusVideoPageProps) {
  const pageUrl = `${baseUrl}/video/walrus/${blobId}`;
  const pageTitle = `Walrus Video - ${blobId}`;
  const description = "Video hosted on Walrus decentralized storage";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />

        {/* Open Graph meta tags for social media */}
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:video" content={videoUrl} />
        <meta property="og:video:url" content={videoUrl} />
        <meta property="og:video:secure_url" content={videoUrl} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        <meta property="og:image" content={`${baseUrl}/images/nounspace_logo.png`} />

        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:player" content={videoUrl} />
        <meta name="twitter:player:width" content="1280" />
        <meta name="twitter:player:height" content="720" />
        <meta name="twitter:player:stream" content={videoUrl} />
        <meta name="twitter:player:stream:content_type" content="video/mp4" />

        {/* Farcaster Frame meta tags */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:video" content={videoUrl} />
        <meta property="fc:frame:video:type" content="video/mp4" />
        <meta property="fc:frame:image" content={`${baseUrl}/images/nounspace_logo.png`} />

        {/* Canonical URL */}
        <link rel="canonical" href={pageUrl} />
      </Head>

      <div className="w-full h-screen bg-black flex items-center justify-center">
        <video
          src={videoUrl}
          controls
          className="max-w-full max-h-full object-contain"
          preload="metadata"
          autoPlay
        >
          Seu navegador não suporta vídeo.
        </video>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { blobId } = context.params as { blobId: string };

  if (!blobId) {
    return { notFound: true };
  }

  const cleanBlobId = blobId.replace(/\.mp4$/, "");

  if (!/^[a-zA-Z0-9_-]+$/.test(cleanBlobId)) {
    return { notFound: true };
  }

  // Use host and proto from incoming request when available (ensures correct public URL on Vercel/preview)
  const forwardedProto = (context.req.headers["x-forwarded-proto"] as string) || "https";
  const host = context.req.headers.host || (process.env.VERCEL_URL ? process.env.VERCEL_URL : "localhost:3000");
  const baseUrl = `${forwardedProto}://${host}`;

  const videoUrl = `${baseUrl}/api/walrus-video/${cleanBlobId}.mp4`;

  return {
    props: {
      blobId: cleanBlobId,
      videoUrl,
      baseUrl,
    },
  };
};
