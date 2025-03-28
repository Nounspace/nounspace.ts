import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";

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

  return (
    <ReactHlsPlayer
      src={url}
      muted={muted}
      autoPlay={true}
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
