import React from "react";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import ChannelSpace from "./ChannelSpace";
import { loadChannelSpaceData } from "./utils";

interface ChannelSpacePageProps {
  params: Promise<{
    channelId: string;
    tabName?: string;
  }>;
}

const ChannelSpacePage = async ({ params }: ChannelSpacePageProps) => {
  const { channelId, tabName: tabNameParam } = await params;

  if (!channelId) {
    return <SpaceNotFound />;
  }

  try {
    const decodedTabName = tabNameParam ? decodeURIComponent(tabNameParam) : undefined;

    const channelSpaceData = await loadChannelSpaceData(channelId, decodedTabName);

    if (!channelSpaceData) {
      return <SpaceNotFound />;
    }

    return (
      <ChannelSpace
        spacePageData={channelSpaceData}
        tabName={decodedTabName || channelSpaceData.defaultTab}
      />
    );
  } catch (error) {
    console.error("Error loading channel space data:", error);
    return <SpaceNotFound />;
  }
};

export default ChannelSpacePage;
