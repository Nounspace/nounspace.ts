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

      if (!playerRef.current) return;

      if (didUnmute) {
        togglePlay();
      } else {
        // Unmute and immediately begin playback so a single click starts the video
        playerRef.current.muted = false;
        setMuted(false);
        setDidUnmute(true);
        playerRef.current.play();
      }
    },
    [didUnmute, togglePlay],
  );

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
