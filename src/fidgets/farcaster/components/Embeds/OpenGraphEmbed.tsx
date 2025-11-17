import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getYouTubeId, isYouTubeUrl } from "@/common/lib/utils/youtubeUtils";

interface OpenGraphEmbedProps {
  url: string;
}

interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url?: string;
}

const OpenGraphEmbed: React.FC<OpenGraphEmbedProps> = ({ url }) => {
  const [ogData, setOgData] = useState<OpenGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isYouTubeUrl(url)) {
      setIsLoading(false);
      return;
    }
    const fetchOGData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/opengraph?url=${encodeURIComponent(url)}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        setOgData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOGData();
  }, [url]);

  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return (
      <div className="w-full max-w-full aspect-video rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="YouTube video player"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 w-full max-w-2xl">
        <div className="animate-pulse">
          <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-300 h-3 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !ogData) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-blue-500 hover:text-blue-700 hover:underline"
      >
        🔗 {new URL(url).hostname}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors w-full max-w-2xl"
    >
      {ogData.image && (
        <div className="relative w-full h-48">
          <Image
            src={ogData.image}
            alt={ogData.title || "Link preview"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-4">
        {ogData.title && (
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {ogData.title}
          </h3>
        )}
        {ogData.description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {ogData.description}
          </p>
        )}
        <div className="flex items-center text-gray-500 text-xs">
          <span className="truncate">
            {ogData.siteName || new URL(url).hostname}
          </span>
        </div>
      </div>
    </a>
  );
};

export default OpenGraphEmbed;