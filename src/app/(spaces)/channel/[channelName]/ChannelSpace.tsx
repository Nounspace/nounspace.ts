"use client";
import React from "react";
import { isArray, isNil } from "lodash";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import createInitialChannelSpaceConfig from "@/constants/initialChannelSpace";
import PublicSpace from "../../PublicSpace";

export interface ChannelSpaceProps {
  spaceOwnerFid: number | null;
  channelName: string;
  spaceId: string | null;
  tabName: string | string[] | null | undefined;
}

const ChannelSpace = ({
  spaceOwnerFid,
  channelName,
  spaceId,
  tabName,
}: ChannelSpaceProps) => {
  if (isNil(spaceOwnerFid)) {
    return <SpaceNotFound />;
  }

  const INITIAL_SPACE_CONFIG = createInitialChannelSpaceConfig(channelName);
  const getSpacePageUrl = (tab: string) => `/channel/${channelName}/${tab}`;

  return (
    <PublicSpace
      spaceId={spaceId}
      tabName={isArray(tabName) ? tabName[0] : tabName || "Profile"}
      initialConfig={INITIAL_SPACE_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      spaceOwnerFid={spaceOwnerFid}
      pageType="channel"
      channelName={channelName}
    />
  );
};

export default ChannelSpace;
