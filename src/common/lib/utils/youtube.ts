import { youtube, youtube_v3 } from "@googleapis/youtube";

const YOUTUBE_ID_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export const getYouTubeVideoId = (url: string): string | null => {
  const regex = YOUTUBE_ID_REGEX;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export async function getYouTubeMetadata(
  url: string,
): Promise<youtube_v3.Schema$Video | null> {
  const videoId = url ? getYouTubeVideoId(url) : null;

  if (!videoId) {
    return null;
  }

  return getYouTubeMetadataById(videoId);
}

export async function getYouTubeMetadataById(
  videoId: string,
): Promise<youtube_v3.Schema$Video | null> {
  if (!videoId) {
    return null;
  }

  try {
    const client = youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    const response = await client.videos.list({
      part: ["snippet"],
      id: [videoId],
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0];
    } else {
      console.log("No video found with the given ID.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching video info:", error);
    return null;
  }
}
