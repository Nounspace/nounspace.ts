import { Metadata } from "next/types";

export const dynamic = "force-dynamic";
import neynar from "@/common/data/api/neynar";
import { CastParamType } from "@neynar/nodejs-sdk/build/api";
import { getCastMetadataStructure } from "@/common/lib/utils/castMetadata";

export async function generateMetadata({ params }): Promise<Metadata> {
  const segments: string[] = Array.isArray(params.slug) ? params.slug : [];
  let castHash: string | undefined;

  if (segments.length >= 3 && segments[0] === "c") {
    castHash = decodeURIComponent(segments[2]);
  } else if (segments.length >= 2) {
    castHash = decodeURIComponent(segments[1]);
  }

  if (!castHash) {
    return {};
  }

  try {
    const { cast } = await neynar.lookupCastByHashOrWarpcastUrl({
      identifier: castHash,
      type: CastParamType.Hash,
    });

    return getCastMetadataStructure({
      hash: cast.hash,
      username: cast.author.username,
      displayName: cast.author.display_name,
      pfpUrl: cast.author.pfp_url,
      text: cast.text,
    });
  } catch (error) {
    console.error("Error generating cast metadata:", error);
    return getCastMetadataStructure({ hash: castHash });
  }
}

export default function HomebaseSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
