import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

interface WalrusVideoPageProps {
  blobId: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export default function WalrusVideoPage({ blobId, videoUrl, thumbnailUrl }: WalrusVideoPageProps) {
  return (
    <>
      <Head>
        <title>Walrus Video - Nounspace</title>
        <meta name="description" content="Video stored on Walrus decentralized storage" />
        
        {/* Open Graph tags - CRITICAL for Farcaster inline video */}
        <meta property="og:title" content="Walrus Video - Nounspace" />
        <meta property="og:description" content="Video stored on Walrus decentralized storage" />
        <meta property="og:type" content="video.other" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/video/walrus/${blobId}`} />
        
        {/* Direct video for inline playback in Farcaster */}
        <meta property="og:video" content={videoUrl} />
        <meta property="og:video:url" content={videoUrl} />
        <meta property="og:video:secure_url" content={videoUrl} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        
        {/* Image for thumbnail - use video thumbnail */}
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_BASE_URL}/api/walrus/thumbnail/${blobId}`} />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
        
        {/* Twitter player tags for video */}
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content="Walrus Video - Nounspace" />
        <meta name="twitter:description" content="Video stored on Walrus decentralized storage" />
        <meta name="twitter:player" content={videoUrl} />
        <meta name="twitter:player:width" content="1280" />
        <meta name="twitter:player:height" content="720" />
        <meta name="twitter:player:stream" content={videoUrl} />
        <meta name="twitter:player:stream:content_type" content="video/mp4" />
        
        {/* Farcaster Frame tags for direct video support */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:video" content={videoUrl} />
        <meta property="fc:frame:video:type" content="video/mp4" />
        <meta property="fc:frame:aspect_ratio" content="16:9" />
        
        {/* Essential meta tags */}
        <meta property="og:site_name" content="Nounspace" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL}/video/walrus/${blobId}`} />
      </Head>

      <div className="w-full h-screen bg-black">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
          autoPlay
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { blobId } = context.params as { blobId: string };
  
  if (!blobId) {
    return {
      notFound: true,
    };
  }

  // Clean the blob ID (remove .mp4 extension if present)
  const cleanBlobId = blobId.replace(/\.mp4$/, '');
  
  // Validate blob ID format
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanBlobId)) {
    return {
      notFound: true,
    };
  }

  // Generate the direct video URL for the video player
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  process.env.NEXT_PUBLIC_URL ||
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                  'http://localhost:3000';

  const videoUrl = `${baseUrl}/api/walrus/video/${cleanBlobId}`;
  
  // For now, we don't have thumbnail generation, but we could add it later
  const thumbnailUrl = undefined;

  return {
    props: {
      blobId: cleanBlobId,
      videoUrl,
      thumbnailUrl,
    },
  };
};
