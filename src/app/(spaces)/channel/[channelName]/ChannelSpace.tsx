"use client";

import React from "react";
import PublicSpace from "../../PublicSpace";
import createInitialChannelSpaceConfig from "@/constants/initialChannelSpace";

export interface ChannelSpaceProps {
  channelName: string;
  spaceId: string | null;
  tabName?: string | null;
  spaceOwnerFid?: number;
}

const ChannelSpace: React.FC<ChannelSpaceProps> = ({
  channelName,
  spaceId,
  tabName,
  spaceOwnerFid,
}) => {
  const INITIAL_CONFIG = createInitialChannelSpaceConfig(channelName);

  const getSpacePageUrl = (tab: string) => `/channel/${channelName}/${tab}`;

  return (
    <PublicSpace
      spaceId={spaceId}
      tabName={tabName ?? "Feed"}
      initialConfig={INITIAL_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      spaceOwnerFid={spaceOwnerFid}
      pageType="channel"
      channelName={channelName}
    />
  );
};

export default ChannelSpace;
