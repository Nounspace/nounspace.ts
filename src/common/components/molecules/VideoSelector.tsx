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
import { useState } from "react";
import AlchemyVideoNftSelector, {
  AlchemyVideoNftSelectorValue,
} from "./AlchemyVideoNFTSelector";
import { YouTubeSelector } from "./YouTubeSelector";

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
  const [videoSource, setVideoSource] = useState<VideoSource>("youtube");

  function handleVideoSelect(videoUrl: string) {
    setSelectedVideo(videoUrl);
    onVideoSelect(videoUrl);
    analytics.track(AnalyticsEvent.MUSIC_UPDATED, { url: videoUrl });
  }

  function handleNftSelect(value: AlchemyVideoNftSelectorValue) {
    console.log("NFT selected", value);
    if (value.imageUrl) handleVideoSelect(value.imageUrl);
  }

  return (
    <div className="grid gap-2">
      <div>
        <span className="text-sm">Select video source</span>
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
      </div>

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
