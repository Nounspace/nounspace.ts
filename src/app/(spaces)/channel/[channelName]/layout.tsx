import { WEBSITE_URL } from "@/constants/app";
import React from "react";
import { getChannelMetadata } from "./utils";
import { Metadata } from "next/types";
import { defaultFrame } from "@/constants/metadata";

const defaultMetadata = {
  other: {
    "fc:frame": JSON.stringify(defaultFrame),
  },
};

export async function generateMetadata({ params }): Promise<Metadata> {
  const { channelName, tabName: tabNameParam } = await params;
  if (!channelName) {
    return defaultMetadata;
  }
  const channel = await getChannelMetadata(channelName.toLowerCase());
  if (!channel) {
    return defaultMetadata;
  }
  const tabName = tabNameParam ? decodeURIComponent(tabNameParam) : undefined;
  const frameUrl = tabName
    ? `${WEBSITE_URL}/channel/${channelName}/${encodeURIComponent(tabName)}`
    : `${WEBSITE_URL}/channel/${channelName}`;
  const displayName = channel.name || channel.id;
  const metadata: Metadata = {
    title: `${displayName} Channel | Nounspace`,
    openGraph: {
      title: `${displayName} Channel | Nounspace`,
      url: frameUrl,
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${WEBSITE_URL}/images/nounspace_logo.png`,
        button: {
          title: `Visit ${displayName} on Nounspace`,
          action: { type: "launch_frame", url: frameUrl, name: `${displayName} Channel`, splashImageUrl: `${WEBSITE_URL}/images/nounspace_logo.png`, splashBackgroundColor: "#FFFFFF" },
        },
      }),
    },
  };
  return metadata;
}

export default function ChannelSpaceLayout({ children }) {
  return <>{children}</>;
}
