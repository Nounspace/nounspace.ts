import React from "react";
import dynamic from "next/dynamic";

const ReactHlsPlayer = dynamic(() => import("@gumlet/react-hls-player"), {
  ssr: false,
});

const VideoEmbed = ({ url }: { url: string }) => {
  const playerRef = React.useRef<HTMLVideoElement | null>(null);

  return (
    <div key={`video-embed-${url}`} className="">
      <ReactHlsPlayer
        src={url}
        autoPlay={false}
        controls={true}
        width="80%"
        height="auto"
        playerRef={playerRef}
        className="rounded-md max-w-min max-h-72 object-left"
      />
    </div>
  );
};

export default VideoEmbed;
