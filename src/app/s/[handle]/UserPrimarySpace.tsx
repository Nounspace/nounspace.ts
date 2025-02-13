"use client";
import React from "react";
import { useAppStore } from "@/common/data/stores/app";
import { isArray, isNil } from "lodash";
import { useEffect } from "react";
import UserDefinedSpace from "@/common/components/pages/UserDefinedSpace";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";

export type UserDefinedSpacePageProps = {
  fid: number | null;
  spaceId: string | null;
  tabName: string | string[] | null | undefined;
};

export const UserPrimarySpace = ({
  fid,
  spaceId,
  tabName,
}: UserDefinedSpacePageProps) => {
  const { loadEditableSpaces } = useAppStore((state) => ({
    loadEditableSpaces: state.space.loadEditableSpaces,
  }));

  useEffect(() => {
    loadEditableSpaces();
  }, []);

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

export default UserPrimarySpace;
