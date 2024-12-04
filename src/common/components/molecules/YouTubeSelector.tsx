import React, { useState, ChangeEvent } from "react";

interface VideoResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
}

interface YouTubeSelectorProps {
  onVideoSelect: (videoUrl: string) => void;
}

export function YouTubeSelector({ onVideoSelect }: YouTubeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);

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

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 2) searchYouTube(query);
  }

  function handleVideoSelect(videoId: string) {
    const videoUrl = `https://www.youtube.com/embed/${videoId}`;
    onVideoSelect(videoUrl);
    setSearchResults([]);
    setSearchQuery("");
  }

  return (
    <div className="grid gap-2">
      <input
        type="text"
        placeholder="Search YouTube"
        value={searchQuery}
        onChange={handleSearchChange}
        className="input-classname rounded-sm p-1 border border-gray-300"
      />
      <ul className="mt-2">
        {searchResults.map((result) => (
          <li
            key={result.id.videoId}
            onClick={() => handleVideoSelect(result.id.videoId)}
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
    </div>
  );
}
