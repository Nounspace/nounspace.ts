import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

interface WalrusVideoPageProps {
  blobId: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export default function WalrusVideoPage({ blobId, videoUrl, thumbnailUrl }: WalrusVideoPageProps) {
  const router = useRouter();

  // If accessed directly, redirect to video player
  const handleVideoClick = () => {
    router.push(`/video/player?url=${encodeURIComponent(videoUrl)}`);
  };

  return (
    <>
      <Head>
        <title>Walrus Video - Nounspace</title>
        <meta name="description" content="Video stored on Walrus decentralized storage" />
        
        {/* Open Graph tags for video preview */}
        <meta property="og:title" content="Walrus Video - Nounspace" />
        <meta property="og:description" content="Video stored on Walrus decentralized storage" />
        <meta property="og:type" content="video.other" />
        <meta property="og:video" content={videoUrl} />
        <meta property="og:video:secure_url" content={videoUrl} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        
        {/* Twitter Card tags for video */}
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content="Walrus Video - Nounspace" />
        <meta name="twitter:description" content="Video stored on Walrus decentralized storage" />
        <meta name="twitter:player" content={videoUrl} />
        <meta name="twitter:player:width" content="1280" />
        <meta name="twitter:player:height" content="720" />
        
        {/* Farcaster specific meta tags */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:video" content={videoUrl} />
        <meta property="fc:frame:video:type" content="video/mp4" />
        
        {thumbnailUrl && (
          <>
            <meta property="og:image" content={thumbnailUrl} />
            <meta name="twitter:image" content={thumbnailUrl} />
            <meta property="fc:frame:image" content={thumbnailUrl} />
          </>
        )}
        
        {/* Additional meta tags */}
        <meta property="og:site_name" content="Nounspace" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/video/walrus/${blobId}`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL}/video/walrus/${blobId}`} />
      </Head>

      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-4xl w-full p-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Walrus Video</h1>
              <p className="text-gray-600 mb-6">
                This video is stored on Walrus decentralized storage.
              </p>
              
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                  onClick={handleVideoClick}
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleVideoClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Open in Player
                </button>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Direct Link
                </a>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Blob ID: {blobId}</p>
                <p>Powered by Walrus decentralized storage</p>
              </div>
            </div>
          </div>
        </div>
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
