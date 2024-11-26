import React, { useState } from "react";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";
import { YouTubeSelector } from "./YouTubeSelector";

export interface VideoSelectorProps {
  initialVideoURL: string | null;
  onVideoSelect: (url: string) => void;
}

export function VideoSelector({
  initialVideoURL,
  onVideoSelect,
}: VideoSelectorProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(
    initialVideoURL,
  );

  function handleVideoSelect(videoUrl: string) {
    setSelectedVideo(videoUrl);
    onVideoSelect(videoUrl);
    analytics.track(AnalyticsEvent.MUSIC_UPDATED, { url: videoUrl });
  }

  return (
    <div className="grid gap-2">
      <YouTubeSelector onVideoSelect={handleVideoSelect} />

      {selectedVideo && (
        <div className="mt-4">
          <h5>Selected Song:</h5>
          <iframe
            width="100%"
            height="150"
            className="rounded-lg"
            src={selectedVideo}
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
