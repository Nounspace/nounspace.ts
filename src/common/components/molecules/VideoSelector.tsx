import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";
import React, { useState } from "react";
import AlchemyVideoNftSelector, {
  AlchemyVideoNftSelectorValue,
} from "./AlchemyVideoNFTSelector";
import { YouTubeSelector } from "./YouTubeSelector";
import Player from "../organisms/Player";

type VideoSource = "youtube" | "wallet";

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
  const [videoSource, setVideoSource] = useState<VideoSource>();

  function handleVideoSelect(videoUrl: string) {
    setSelectedVideo(videoUrl);
    onVideoSelect(videoUrl);
    analytics.track(AnalyticsEvent.MUSIC_UPDATED, { url: videoUrl });
  }

  function handleNftSelect(value: AlchemyVideoNftSelectorValue) {
    // console.log("NFT selected", value);
    if (value.imageUrl) handleVideoSelect(value.imageUrl);
  }

  return (
    <div className="grid gap-2">
      <Select
        onValueChange={(value: VideoSource) => setVideoSource(value)}
        value={videoSource}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a video source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="youtube">Select from YouTube</SelectItem>
          <SelectItem value="wallet">Select from Wallet</SelectItem>
        </SelectContent>
      </Select>

      {videoSource === "youtube" && (
        <YouTubeSelector onVideoSelect={handleVideoSelect} />
      )}
      {videoSource === "wallet" && (
        <div className="text-sm text-gray-500">
          <AlchemyVideoNftSelector onChange={handleNftSelect} value={{}} />
        </div>
      )}

      {selectedVideo && (
        <div className="mt-4">
          <h5 className="text-sm">Selected Song:</h5>
          <Player url={selectedVideo} />
        </div>
      )}
    </div>
  );
}
