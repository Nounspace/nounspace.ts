"use client";

import React, { useMemo } from "react";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ProfileSpaceData } from "@/common/types/spaceData";

export interface ProfileSpaceProps {
  spaceData: Omit<ProfileSpaceData, 'isEditable' | 'spacePageUrl'>;
  tabName: string;
}

// Helper function to check if profile space is editable
const isProfileSpaceEditable = (
  fid: number,
  currentUserFid: number | undefined
): boolean => {
  return currentUserFid !== undefined && currentUserFid === fid;
};

export default function ProfileSpace({
  spaceData,
  tabName,
}: ProfileSpaceProps) {
  console.log("🔍 [2/7] ProfileSpace (Client-side) - spaceData received from server:", { spaceData, tabName });

  // Add isEditable and spacePageUrl logic on the client side
  const spaceDataWithEditability = useMemo(() => ({
    ...spaceData,
    spacePageUrl: (tabName: string) => `/s/${spaceData.spaceName}/${encodeURIComponent(tabName)}`,
    isEditable: (currentUserFid: number | undefined) => 
      isProfileSpaceEditable(spaceData.fid, currentUserFid),
  }), [spaceData]);

  return (
    <PublicSpace
      spaceData={spaceDataWithEditability}
      tabName={tabName}
    />
  );
}
