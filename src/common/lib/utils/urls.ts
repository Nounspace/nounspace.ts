export const isImageUrl = (url: string) => {
  if (!url) {
    return false;
  }

  try {
    const { hostname } = new URL(url);
    if (hostname === "res.cloudinary.com") {
      return true;
    }
  } catch (error) {
    // Ignore URL parsing errors and fall through to other checks
  }

  return (
    url.match(/\.(jpeg|jpg|gif|png)$/) != null ||
    url.includes("imagedelivery") ||
    url.startsWith("blob:")
  );
};

export const isWebUrl = (url: string) => {
  if (!url) {
    return false;
  }

  return url.match(/^(http|https):\/\//) != null;
};

const VIDEO_STREAM_DOMAINS = [
  "https://stream.warpcast.com",
  "https://stream.farcaster.xyz",
];

const VIDEO_PATH_REGEX = /\/~\/(video|shorts)\//i;

const VIDEO_EXTENSION_REGEX = /\.(m3u8|mp4|webm|mov|ogg)(\?|$)/i;

export const isVideoUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }

  const lowerUrl = url.toLowerCase();

  return (
    VIDEO_STREAM_DOMAINS.some((domain) => lowerUrl.startsWith(domain)) ||
    VIDEO_PATH_REGEX.test(lowerUrl) ||
    VIDEO_EXTENSION_REGEX.test(lowerUrl)
  );
};
