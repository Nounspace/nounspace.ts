import { WEBSITE_URL } from "@/constants/app";
import type { Metadata } from "next/types";
import { getChannelMetadata } from "./utils";

const DEFAULT_METADATA: Metadata = {
  title: "Channel | Nounspace",
  description: "Explore Farcaster channel spaces on Nounspace.",
  openGraph: {
    title: "Channel | Nounspace",
    description: "Explore Farcaster channel spaces on Nounspace.",
    url: WEBSITE_URL,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ channelId: string; tabName?: string }>;
}): Promise<Metadata> {
  const { channelId, tabName } = await params;

  if (!channelId) {
    return DEFAULT_METADATA;
  }

  const channel = await getChannelMetadata(channelId);

  if (!channel) {
    return {
      ...DEFAULT_METADATA,
      title: `${channelId} | Nounspace`,
    };
  }

  const name = channel.name || channel.id;
  const description = channel.description || `Farcaster channel /${channel.id} on Nounspace.`;
  const pageUrl = tabName
    ? `${WEBSITE_URL}/c/${channel.id}/${encodeURIComponent(tabName)}`
    : `${WEBSITE_URL}/c/${channel.id}`;

  return {
    title: `${name} | Nounspace`,
    description,
    openGraph: {
      title: `${name} | Nounspace`,
      description,
      url: pageUrl,
      images: channel.image_url ? [channel.image_url] : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
