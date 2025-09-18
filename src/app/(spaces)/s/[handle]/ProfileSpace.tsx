"use client";

import React, { useMemo } from "react";
import { isArray, isNil } from "lodash";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import PublicSpace from "../../PublicSpace";
import { SPACE_TYPES } from "@/common/constants/spaceTypes";
import { ProfileSpaceData } from "@/common/types/space";

export type UserDefinedSpacePageProps = {
  spaceOwnerFid: number | null;
  spaceOwnerUsername: string | null;
  spaceId?: string;
  tabName: string | string[] | null | undefined;
};

export const ProfileSpace = ({
  spaceOwnerFid,
  spaceOwnerUsername,
  spaceId,
  tabName,
}: UserDefinedSpacePageProps) => {
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
    // Configuration
    config: INITIAL_PERSONAL_SPACE_CONFIG
  };

  return (
    <PublicSpace
      spaceData={profileSpaceData}
      tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
      getSpacePageUrl={getSpacePageUrl}
    />
  );
};

export default ProfileSpace;
