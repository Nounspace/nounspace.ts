"use client";

import React, { useMemo } from "react";
import { isArray, isNil } from "lodash";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import PublicSpace from "../../PublicSpace";
import { SPACE_TYPES, ProfileSpaceData } from "@/common/types/space";

// Editability logic for profile spaces
const checkProfileSpaceEditability = (
  fid: number,
  currentUserFid: number | undefined
): boolean => {
  return !isNil(currentUserFid) && currentUserFid === fid;
};

export type ProfileSpaceProps = {
  spaceOwnerFid: number | undefined;
  spaceOwnerUsername: string | undefined;
  spaceId?: string;
  tabName: string | string[] | undefined;
};

export const ProfileSpace = ({
  spaceOwnerFid,
  spaceOwnerUsername,
  spaceId,
  tabName,
}: ProfileSpaceProps) => {
  if (isNil(spaceOwnerFid)) {
    return <SpaceNotFound />;
  }

  const INITIAL_PERSONAL_SPACE_CONFIG = useMemo(
    () =>
      createIntialPersonSpaceConfigForFid(
        spaceOwnerFid,
        spaceOwnerUsername ?? undefined,
      ),
    [spaceOwnerFid, spaceOwnerUsername],
  );

  const getSpacePageUrl = (tabName: string) => {
    if (!spaceOwnerUsername) return '#';
    return `/s/${spaceOwnerUsername}/${tabName}`;
  };
  
  // Create a properly typed ProfileSpace object
  const profileSpaceData: ProfileSpaceData = {
    // Metadata
    id: spaceId || undefined,
    spaceName: spaceOwnerUsername || "Profile",
    spaceType: SPACE_TYPES.PROFILE,
    updatedAt: new Date().toISOString(),
    fid: spaceOwnerFid,
    // URL generation
    spacePageUrl: getSpacePageUrl,
    // Editability logic
    isEditable: (currentUserFid: number | undefined) => checkProfileSpaceEditability(spaceOwnerFid, currentUserFid),
    // Configuration
    config: INITIAL_PERSONAL_SPACE_CONFIG
  };

  return (
    <PublicSpace
      spaceData={profileSpaceData}
      tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
    />
  );
};

export default ProfileSpace;
