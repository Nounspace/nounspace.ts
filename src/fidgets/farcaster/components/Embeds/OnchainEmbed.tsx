import React from "react";

const OnchainEmbed = ({ url }: { url: string }) => {
  return (
    <div key={`onchain-embed-${url}`} className="opacity-80 text-sm">
      {url}
    </div>
  );
};

export default OnchainEmbed;
