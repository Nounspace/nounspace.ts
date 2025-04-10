"use client";
import React from "react";
import { useAppStore } from "@/common/data/stores/app";
import { isArray, isNil } from "lodash";
import { useEffect } from "react";
import UserDefinedSpace from "@/app/(spaces)/UserDefinedSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";

export type UserDefinedSpacePageProps = {
  fid: number | null;
  spaceId: string | null;
  tabName: string | string[] | null | undefined;
};

export const ProfileSpace = ({
  fid,
  spaceId,
  tabName,
}: UserDefinedSpacePageProps) => {
  
  console.log("ProfileSpace component mounting with props:", { fid, spaceId, tabName });

  if (isNil(fid)) {
    return <SpaceNotFound />;
  }

  return (
    <UserDefinedSpace
      fid={fid}
      spaceId={spaceId}
      tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
    />
  );
};

export default ProfileSpace;
