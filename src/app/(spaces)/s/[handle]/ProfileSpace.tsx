"use client";

import React, { useEffect, useState } from "react";
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

  console.log("ProfileSpace component mounting with props:", { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName });

  if (isNil(spaceOwnerFid)) {
    return <SpaceNotFound />;
  }

  const INITIAL_PERSONAL_SPACE_CONFIG = createIntialPersonSpaceConfigForFid(spaceOwnerFid);

  const getSpacePageUrl = (tabName: string) => {
    if (!spaceOwnerUsername) return '#';
    return `/s/${spaceOwnerUsername}/${tabName}`;
  };

  // Determine if the current user can edit this space
  function isEditable(userFid: number) {
    return userFid === spaceOwnerFid;
  }

  return (
    <PublicSpace
        spaceId={spaceId}
        tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
        initialConfig={INITIAL_PERSONAL_SPACE_CONFIG}
        getSpacePageUrl={getSpacePageUrl}
        spaceOwnerFid={spaceOwnerFid}
        isEditable={isEditable}
      />
  );
};

export default ProfileSpace;
