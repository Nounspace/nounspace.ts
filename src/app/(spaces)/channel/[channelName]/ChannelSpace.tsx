"use client";
import React from "react";
import PublicSpace from "../../PublicSpace";
import createInitialChannelSpaceConfig from "@/constants/initialChannelSpace";
import { Channel } from "@neynar/nodejs-sdk/build/api";

interface ChannelSpaceProps {
  channel: Channel;
}

export default function ChannelSpace({ channel }: ChannelSpaceProps) {
  const INITIAL_CONFIG = createInitialChannelSpaceConfig(channel.id);
  const getSpacePageUrl = (tabName: string) => `/channel/${channel.id}/${tabName}`;

  return (
    <PublicSpace
      spaceId={null}
      tabName="Profile"
      initialConfig={INITIAL_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      spaceOwnerFid={channel.lead?.fid}
      pageType="channel"
    />
  );
}
