"use client";
import React from "react";
import { isArray, isNil } from "lodash";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import createInitialChannelSpaceConfig from "@/constants/initialChannelSpace";
import PublicSpace from "../../PublicSpace";

export interface ChannelSpaceProps {
  channelName: string | null;
  ownerFid: number | null;
  spaceId: string | null;
  tabName: string | string[] | null | undefined;
}

export const ChannelSpace = ({
  channelName,
  ownerFid,
  spaceId,
  tabName,
}: ChannelSpaceProps) => {
  if (isNil(channelName) || isNil(ownerFid)) {
    return <SpaceNotFound />;
  }

  const initialConfig = createInitialChannelSpaceConfig(channelName);

  const getSpacePageUrl = (tabName: string) => `/channel/${channelName}/${tabName}`;

  return (
    <PublicSpace
      spaceId={spaceId}
      tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
      initialConfig={initialConfig}
      getSpacePageUrl={getSpacePageUrl}
      spaceOwnerFid={ownerFid}
      pageType="channel"
    />
  );
};

export default ChannelSpace;
