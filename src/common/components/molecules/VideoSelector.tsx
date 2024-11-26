import React, { useState, ChangeEvent } from "react";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";

interface VideoSelectorProps {
  initialVideoURL: string | null;
  onVideoSelect: (url: string) => void;
}

export function VideoSelector({
  initialVideoURL,
  onVideoSelect,
}: VideoSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(
    initialVideoURL,
  );

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 2) searchYouTube(query);
  }

  async function searchYouTube(query: string) {
    try {
      const response = await fetch(
        `/api/youtube-search?query=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error fetching YouTube search results:", error);
    }
  }

  function handleVideoSelect(videoId: string) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    setSelectedVideo(videoUrl);
    onVideoSelect(videoUrl);
    analytics.track(AnalyticsEvent.MUSIC_UPDATED, { url: videoUrl });
  }

  return (
    <div className="grid gap-2">
      <input
        type="text"
        placeholder="Search or paste YouTube link"
        value={searchQuery}
        onChange={handleSearchChange}
        className="input-classname rounded-sm p-1 border border-gray-300"
      />
      <ul className="mt-2">
        {searchResults.map((result: any) => (
          <li
            key={result.id.videoId}
            onClick={() => {
              handleVideoSelect(result.id.videoId);
              setSearchResults([]);
            }}
            className="cursor-pointer hover:bg-gray-200 p-2 rounded text-xs"
          >
            <div className="flex items-center gap-2">
              <img
                className="rounded-sm h-8"
                src={result.snippet.thumbnails.default.url}
                alt={result.snippet.title}
              />
              <span>{result.snippet.title}</span>
            </div>
          </li>
        ))}
      </ul>
      {selectedVideo && (
        <div className="mt-4">
          <h5>Selected Song:</h5>
          <iframe
            width="100%"
            height="150"
            className="rounded-lg"
            src={`https://www.youtube.com/embed/${new URL(selectedVideo).searchParams.get("v")}`}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
