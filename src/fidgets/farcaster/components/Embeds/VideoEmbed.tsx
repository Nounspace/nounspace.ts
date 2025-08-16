import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactHlsPlayer = dynamic(() => import("@gumlet/react-hls-player"), {
  ssr: false,
});

const WALRUS_AGGREGATOR_URL =
  "https://aggregator.walrus-testnet.walrus.space";

const VideoEmbed = ({ url }: { url: string }) => {
  const realUrl = url.split("#")[0];
  const isHls = realUrl.toLowerCase().endsWith(".m3u8");
  const [muted, setMuted] = useState(true);
  const [didUnmute, setDidUnmute] = useState(false);
  const [src, setSrc] = useState(realUrl);
  const playerRef = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!realUrl.startsWith(WALRUS_AGGREGATOR_URL)) {
      setSrc(realUrl);
      return;
    }

    let objectUrl: string | undefined;
    (async () => {
      try {
        const res = await fetch(realUrl);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(
          blob.type.startsWith("video/") ? blob : blob.slice(0, blob.size, "video/mp4"),
        );
        setSrc(objectUrl);
      } catch {
        setSrc(realUrl);
      }
    })();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [realUrl]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (playerRef.current.paused) {
      void playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, []);

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

  if (isHls) {
    return (
      <ReactHlsPlayer
        src={realUrl}
        muted={muted}
        autoPlay={false}
        controls
        width="100%"
        height="auto"
        playerRef={playerRef}
        onClick={onClick}
        className="object-contain size-full"
      />
    );
  }

  return (
    <video
      src={src}
      muted={muted}
      controls
      ref={playerRef}
      onClick={onClick}
      className="object-contain size-full"
    />
  );
};

export default VideoEmbed;
