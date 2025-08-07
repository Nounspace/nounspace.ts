"use client";

import React from "react";
import { isArray, isNil } from "lodash";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import PublicSpace from "../../PublicSpace";

export type UserDefinedSpacePageProps = {
  spaceOwnerFid: number | null;
  spaceOwnerUsername: string | null;
  spaceId: string | null;
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

  const INITIAL_PERSONAL_SPACE_CONFIG = createIntialPersonSpaceConfigForFid(
    spaceOwnerFid,
    spaceOwnerUsername ?? undefined,
  );

  const getSpacePageUrl = (tabName: string) => {
    if (!spaceOwnerUsername) return '#';
    return `/s/${spaceOwnerUsername}/${tabName}`;
  };

  return (
    <PublicSpace
      spaceId={spaceId}
      tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
      initialConfig={INITIAL_PERSONAL_SPACE_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      spaceOwnerFid={spaceOwnerFid}
    />
  );
};

export default ProfileSpace;
