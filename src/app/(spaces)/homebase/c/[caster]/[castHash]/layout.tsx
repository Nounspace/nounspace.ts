import { WEBSITE_URL } from "@/constants/app";
import { Metadata } from "next/types";
import axios from "axios";
import { getCastMetadataStructure } from "@/common/lib/utils/castMetadata";
import { isImageUrl } from "@/common/lib/utils/urls";

export async function generateMetadata({
  params: { caster, castHash },
}): Promise<Metadata> {
  if (!caster || !castHash) {
    return {};
  }

  try {
    const { data } = await axios.get(
      `${WEBSITE_URL}/api/farcaster/neynar/cast`,
      {
        params: { identifier: castHash, type: "hash" },
      },
    );

    const cast = data.cast || data;
    const username: string = cast?.author?.username || caster;
    const displayName: string = cast?.author?.display_name || "";
    const pfpUrl: string = cast?.author?.pfp_url || "";
    const text: string = cast?.text || "";
    const timestamp: number | string | undefined = cast?.timestamp;
    let imageUrl: string | undefined;

    if (Array.isArray(cast.embeds)) {
      for (const embed of cast.embeds) {
        if ("url" in embed && isImageUrl(embed.url)) {
          imageUrl = embed.url;
          break;
        }
      }
    }

    const truncated =
      text.length > 320 ? `${text.slice(0, 320)}...` : text;

    return getCastMetadataStructure({
      username,
      displayName,
      pfpUrl,
      text: truncated,
      imageUrl,
      timestamp,
    });
  } catch (error) {
    console.error("Error generating cast metadata:", error);
    return {};
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
