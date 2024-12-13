import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactElement,
} from "react";
import { YouTubeConfig } from "react-player/youtube";
import ReactPlayer from "react-player";
import Image from "next/image";
import useHasWindow from "@/common/lib/hooks/useHasWindow";
import { IconType } from "react-icons";
import {
  LiaVolumeUpSolid,
  LiaVolumeMuteSolid,
  LiaCircleNotchSolid,
} from "react-icons/lia";
import { Button } from "@/common/components/atoms/button";
import { trackAnalyticsEvent } from "@/common/lib/utils/analyticsUtils";
import { AnalyticsEvent } from "@/common/providers/AnalyticsProvider";
import { Address } from "viem";
import ScanAddress from "../molecules/ScanAddress";
import { AlchemyNetwork } from "@/fidgets/ui/gallery";

type ContentMetadata = {
  title?: string | null;
  channel?: string | null | ReactElement;
  thumbnail?: string | null;
};
export type PlayerProps = {
  url: string | string[];
};

const getToggleIcon = ({ playing, started, ready }): [IconType, string] => {
  if ((playing && !started) || !ready) {
    return [LiaCircleNotchSolid, "animate-spin"];
  } else if (playing) {
    return [LiaVolumeUpSolid, ""];
  } else {
    return [LiaVolumeMuteSolid, ""];
  }
};

export const Player: React.FC<PlayerProps> = ({ url }) => {
  const hasWindow = useHasWindow();
  const playerRef = useRef<ReactPlayer | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [metadata, setMetadata] = useState<ContentMetadata | null>(null);
  const [ToggleIcon, iconClassNames] = getToggleIcon({
    playing,
    started,
    ready,
  });

  const getMetadata = async (_url: string | string[]) => {
    // Handle array of URLs by taking the first one
    const videoUrl = Array.isArray(_url) ? _url[0] : _url;

    if (videoUrl.includes("ipfs") || videoUrl.includes("arweave")) {
      // Parse URL parameters for IPFS content
      const url = new URL(videoUrl);
      const contractName = url.searchParams.get("contractName");
      const contractAddress = url.searchParams.get(
        "contractAddress",
      ) as Address;
      const thumbnailUrl = url.searchParams.get("thumbnailUrl");
      const chain = url.searchParams.get("chain") as AlchemyNetwork;

      setMetadata({
        title: contractName || "NFT",
        channel: <ScanAddress address={contractAddress} chain={chain} />,
        thumbnail: thumbnailUrl || null,
      });
      return;
    }

    // Default to YouTube metadata
    const response = await fetch(`/api/metadata/youtube?url=${videoUrl}`);
    const data = await response.json();
    const snippet = data?.value?.snippet;

    if (!snippet) return;

    setMetadata({
      title: snippet.title,
      channel: snippet.channelTitle,
      thumbnail: snippet.thumbnails?.medium?.url,
    });
  };

  useEffect(() => {
    getMetadata(url);
  }, [url]);

  useEffect(() => {
    if (playing && started) {
      setMuted(false);
    }
  }, [playing, started]);

  const onPlay = useCallback(() => {
    trackAnalyticsEvent(AnalyticsEvent.PLAY, { url });
    setPlaying(true);
  }, []);

  const onPause = useCallback(() => {
    trackAnalyticsEvent(AnalyticsEvent.PAUSE, { url });
    setPlaying(false);
  }, []);

  const onReady = useCallback((player) => {
    setReady(true);
  }, []);

  const onStart = useCallback(() => {
    setStarted(true);
  }, []);

  const onUnstarted = useCallback(() => {
    setStarted(false);
  }, []);

  const youtubeConfig: YouTubeConfig = {
    playerVars: {
      showinfo: 0,
      autoplay: 0,
    },
    embedOptions: {},
    onUnstarted: onUnstarted,
  };

  return (
    <>
      <div className="flex items-center border border-gray-200 rounded-full md:rounded-lg overflow-hidden">
        <div className="overflow-hidden relative w-8 h-8 md:w-16 md:h-auto ml-2 md:ml-auto flex-shrink-0 self-center md:self-stretch rounded-lg md:rounded-none">
          {metadata?.thumbnail && (
            <Image
              src={metadata?.thumbnail}
              alt="poster"
              layout="fill"
              objectFit="cover"
            />
          )}
        </div>
        <div className="flex items-center pl-2 p-1 md:p-2 gap-2 flex-auto overflow-hidden">
          <div className="flex-auto">
            <p className="text-gray-800 text-[12px]/[1.4] font-bold line-clamp-1 md:line-clamp-2">
              {metadata?.title || ""}
            </p>
            <p className="text-gray-500 text-[10px]/[1.5] font-semibold line-clamp-1 md:mt-1">
              {metadata?.channel || ""}
            </p>
          </div>
          <Button
            onClick={playing ? onPause : onPlay}
            aria-label="Play/Pause"
            className="flex items-center justify-center flex-none rounded-full h-9 w-9 md:h-7 md:w-7 p-0 text-gray-500 bg-gray-300"
            disabled={!ready}
            variant="secondary"
          >
            <ToggleIcon className={iconClassNames} size={20} />
          </Button>
        </div>
      </div>
      {hasWindow && (
        <ReactPlayer
          className="hidden"
          url={url}
          ref={playerRef}
          playing={playing}
          loop={true}
          light={false}
          controls={false}
          muted={muted}
          config={{
            youtube: youtubeConfig,
          }}
          onReady={onReady}
          onStart={onStart}
          onPause={onPause}
        />
      )}
    </>
  );
};

export default Player;
