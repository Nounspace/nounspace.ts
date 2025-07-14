"use client";

import React from "react";
import { isArray } from "lodash";
import createInitialChannelSpaceConfigForName from "@/constants/initialChannelSpace";
import PublicSpace from "../../PublicSpace";

export interface ChannelSpaceProps {
  spaceOwnerFid: number | null;
  spaceId: string | null;
  tabName: string | string[] | null | undefined;
  channelName: string;
}

const ChannelSpace: React.FC<ChannelSpaceProps> = ({
  spaceOwnerFid,
  spaceId,
  tabName,
  channelName,
}) => {

  const INITIAL_CHANNEL_SPACE_CONFIG = createInitialChannelSpaceConfigForName(
    channelName,
  );

  const getSpacePageUrl = (tab: string) => `/channel/${channelName}/${tab}`;

  return (
    <PublicSpace
      spaceId={spaceId}
      tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
      initialConfig={INITIAL_CHANNEL_SPACE_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      spaceOwnerFid={spaceOwnerFid}
      pageType="profile"
    />
  );
};

export default ChannelSpace;
