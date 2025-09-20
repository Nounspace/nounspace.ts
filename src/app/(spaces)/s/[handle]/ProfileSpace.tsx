import React, { useMemo } from "react";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ProfileSpaceData } from "@/common/types/spaceData";

export interface ProfileSpaceProps {
  spaceData: Omit<ProfileSpaceData, 'isEditable'>;
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
  // Add isEditable logic on the client side
  const spaceDataWithEditability = useMemo(() => ({
    ...spaceData,
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
