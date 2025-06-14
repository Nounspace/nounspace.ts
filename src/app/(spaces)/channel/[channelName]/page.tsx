import React from "react";
import { getChannelMetadata, getTabList, type Tab } from "./utils";
import ChannelSpace from "./ChannelSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { unstable_noStore as noStore } from "next/cache";

const loadChannelSpaceData = async (
  channelName: string,
  tabNameParam?: string,
) => {
  noStore();
  const channelMeta = await getChannelMetadata(channelName);
  const fid = channelMeta.fid;
  if (!fid) return { spaceOwnerFid: null, spaceId: null, tabName: null };
  const tabs = await getTabList(fid, channelName);
  if (!tabs || tabs.length === 0) {
    return { spaceOwnerFid: fid, spaceId: null, tabName: null };
  }
  const defaultTab: Tab = tabs[0];
  const spaceId = defaultTab.spaceId;
  const tabName = tabNameParam || defaultTab.spaceName;
  return { spaceOwnerFid: fid, spaceId, tabName };
};

const ChannelSpacePage = async ({ params }) => {
  const { channelName, tabName: tabNameParam } = await params;
  if (!channelName) return <SpaceNotFound />;
  const { spaceOwnerFid, spaceId, tabName } = await loadChannelSpaceData(
    channelName,
    tabNameParam ? decodeURIComponent(tabNameParam) : undefined,
  );
  return (
    <ChannelSpace
      spaceOwnerFid={spaceOwnerFid}
      channelName={channelName}
      spaceId={spaceId}
      tabName={tabName}
    />
  );
};

export default ChannelSpacePage;
