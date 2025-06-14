export const isImageUrl = (url: string) => {
  if (!url) {
    return false;
  }

  return (
    url.match(/\.(jpeg|jpg|gif|png)$/) != null || url.includes("imagedelivery")
  || url.startsWith("blob:")
  );
};

export const isWebUrl = (url: string) => {
  if (!url) {
    return false;
  }

  return url.match(/^(http|https):\/\//) != null;
};

export const isVideoUrl = (url: string) => {
  if (!url) {
    return false;
  }

  return (
    url.startsWith("https://stream.warpcast.com") ||
    url.startsWith("https://stream.farcaster.xyz") ||
    url.includes("/~/video/") ||
    url.includes("/~/shorts/") ||
    /\.m3u8($|\?)/.test(url) ||
    /\.mp4($|\?)/.test(url)
  );
};
