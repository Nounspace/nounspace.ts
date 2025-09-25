"use client";

import React, { useMemo } from "react";
import { ChannelSpaceData } from "@/common/types/spaceData";
import PublicSpace from "../../PublicSpace";

export interface ChannelSpaceProps {
  spaceData: Omit<ChannelSpaceData, 'isEditable' | 'spacePageUrl'>;
  tabName: string;
}

const ChannelSpace: React.FC<ChannelSpaceProps> = ({
  spaceData,
  tabName,
}) => {
  const spaceDataWithEditability = useMemo(() => ({
    ...spaceData,
    isEditable: (currentUserFid: number | undefined, wallets?: { address: any }[]) => 
      isChannelSpaceEditable(spaceData.spaceOwnerFid, currentUserFid),
    spacePageUrl: (tabName: string) => `/channel/${spaceData.channelName}/${tabName}`,
  }), [spaceData]);

  return (
    <PublicSpace
      spacePageData={spaceDataWithEditability}
      tabName={tabName}
    />
  );
};

// Channel space editability logic
const isChannelSpaceEditable = (
  spaceOwnerFid: number | undefined,
  currentUserFid: number | undefined,
): boolean => {
  if (!currentUserFid || !spaceOwnerFid) {
    return false;
  }
  
  // Channel spaces are editable by the channel lead/owner
  return currentUserFid === spaceOwnerFid;
};

export default ChannelSpace;
