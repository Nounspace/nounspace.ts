import React from "react";
import { loadChannelSpaceData } from "./utils";
import ChannelSpace from "./ChannelSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";

export default async function ChannelSpacePage({ 
  params 
}: {
  params: Promise<{ channelName: string; tabName?: string }>
}) {
  const { channelName, tabName: tabNameParam } = await params;
  
  if (!channelName) {
    return <SpaceNotFound />;
  }

  const decodedTabName = tabNameParam ? decodeURIComponent(tabNameParam) : undefined;
  const channelSpaceData = await loadChannelSpaceData(
    channelName,
    decodedTabName,
  );

  if (!channelSpaceData) {
    return <SpaceNotFound />;
  }

  return (
    <ChannelSpace
      spaceData={channelSpaceData}
      tabName={decodedTabName || channelSpaceData.defaultTab}
    />
  );
}
