import { convertToAggregatorUrl, isWalrusUrl } from "@/common/lib/utils/walrus";
import dynamic from "next/dynamic";
import React, { useCallback, useState } from "react";

const ReactHlsPlayer = dynamic(() => import("@gumlet/react-hls-player"), {
  ssr: false,
});

const VideoEmbed = ({ url }: { url: string }) => {
  const [muted, setMuted] = useState(true);
  const [didUnmute, setDidUnmute] = useState(false);
  const playerRef = React.useRef<HTMLVideoElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (playerRef?.current.paused) {
      playerRef?.current?.play();
    } else {
      playerRef?.current?.pause();
    }
  }, [playerRef?.current]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (didUnmute) {
        togglePlay();
      } else {
        setMuted(false);
        setDidUnmute(true);
      }
    },
    [didUnmute, togglePlay],
  );

  // For Walrus videos, use native video element with aggregator URL
  if (isWalrusUrl(url)) {
    const aggregatorUrl = convertToAggregatorUrl(url);
    
    return (
      <video
        ref={playerRef}
        src={aggregatorUrl}
        muted={muted}
        autoPlay={false}
        controls={true}
        width="100%"
        height="auto"
        onClick={onClick}
        className="object-contain size-full"
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  // For HLS streams and other video formats
  return (
    <ReactHlsPlayer
      src={url}
      muted={muted}
      autoPlay={false}
      controls={true}
      width="100%"
      height="auto"
      playerRef={playerRef}
      onClick={onClick}
      className="object-contain size-full"
    />
  );
};

export default VideoEmbed;
