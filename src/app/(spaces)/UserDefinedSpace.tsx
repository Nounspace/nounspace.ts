"use client";
import React, { useEffect } from "react";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { first } from "lodash";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import PublicSpace from "./PublicSpace";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";

export default function UserDefinedSpace({
  spaceId,
  tabName,
  fid,
}: {
  spaceId: string | null;
  tabName: string;
  fid: number;
}) {
  console.log("UserDefinedSpace component mounting with props:", { spaceId, tabName, fid });

  const { data, isLoading } = useLoadFarcasterUser(fid);
  const user = first(data?.users);
  const username = user?.username;
  const currentUserFid = useCurrentFid();

  const INITIAL_PERSONAL_SPACE_CONFIG = createIntialPersonSpaceConfigForFid(fid);

  const getSpacePageUrl = (tabName: string) => {
    if (!username) return '#';
    return `/s/${username}/${tabName}`;
  };

  // Determine if the current user can edit this space
  const isEditable = currentUserFid === fid;

  console.log("UserDefinedSpace rendering with:", { 
    username, 
    INITIAL_PERSONAL_SPACE_CONFIG, 
    isEditable,
    isLoading,
    hasUser: !!user 
  });

  if (isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  return (
    <PublicSpace
      spaceId={spaceId}
      tabName={tabName}
      initialConfig={INITIAL_PERSONAL_SPACE_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      fid={fid}
      isEditable={isEditable}
    />
  );
}