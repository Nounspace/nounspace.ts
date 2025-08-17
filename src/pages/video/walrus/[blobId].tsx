import React from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";

interface WalrusVideoPageProps {
  blobId: string;
  videoUrl: string;
}

export default function WalrusVideoPage({ blobId, videoUrl }: WalrusVideoPageProps) {
  return (
    <>
      <Head>
        <title>Walrus Video {blobId}</title>
        <meta name="description" content="Vídeo hospedado no Walrus" />

        {/* Meta tags para redes sociais */}
        <meta property="og:type" content="video" />
        <meta property="og:video" content={videoUrl} />
        <meta property="og:video:url" content={videoUrl} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
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

  // 👉 Usa a rota da API que serve o vídeo corretamente
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";

  const videoUrl = `${baseUrl}/api/walrus/video/${cleanBlobId}`;

  return {
    props: {
      blobId: cleanBlobId,
      videoUrl,
    },
  };
};
