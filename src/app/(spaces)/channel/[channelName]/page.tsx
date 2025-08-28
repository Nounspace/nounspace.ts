import React from "react";
import { getChannelMetadata, getTabList, type Tab } from "./utils";
import ChannelSpace from "./ChannelSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { unstable_noStore as noStore } from "next/cache";

const loadChannelSpaceData = async (
  channelName: string,
  tabNameParam?: string,
): Promise<{ spaceOwnerFid: number | null; spaceId: string | null; tabName: string | null }> => {
  noStore();
  const channelMetadata = await getChannelMetadata(channelName.toLowerCase());
  const spaceOwnerFid = channelMetadata?.leadFid ?? null;
  const tabList: Tab[] = await getTabList(channelName.toLowerCase());
  if (!tabList || tabList.length === 0) {
    return { spaceOwnerFid, spaceId: null, tabName: tabNameParam || null };
  }
  const defaultTab: Tab = tabList[0];
  const spaceId = defaultTab.spaceId;
  const tabName = tabNameParam || defaultTab.spaceName;
  return { spaceOwnerFid, spaceId, tabName };
};

const ChannelSpacePage = async ({ params }) => {
  const { channelName, tabName: tabNameParam } = await params;
  if (!channelName) {
    return <SpaceNotFound />;
  }
  const decodedTabName = tabNameParam ? decodeURIComponent(tabNameParam) : undefined;
  const { spaceOwnerFid, spaceId, tabName } = await loadChannelSpaceData(
    channelName,
    decodedTabName,
  );
  return (
    <ChannelSpace
      channelName={channelName}
      spaceOwnerFid={spaceOwnerFid}
      spaceId={spaceId}
      tabName={tabName}
    />
  );
}; 

export default ChannelSpacePage;
