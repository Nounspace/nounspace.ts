"use client";
import React, { Suspense, useEffect } from "react";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { first } from "lodash";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";
import PublicSpace from "./PublicSpace";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";

function LoadingPlaceholder() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

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

  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <PublicSpace
        spaceId={spaceId}
        tabName={tabName}
        initialConfig={INITIAL_PERSONAL_SPACE_CONFIG}
        getSpacePageUrl={getSpacePageUrl}
        fid={fid}
        isEditable={isEditable}
      />
    </Suspense>
  );
}