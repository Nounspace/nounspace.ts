"use client";

import React from "react";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";
import SpaceLoading from "./SpaceLoading";
import { SpacePageType } from "./PublicSpace";

interface PublicSpaceSkeletonProps {
  isTokenPage?: boolean;
  spaceOwnerFid?: number;
  pageType?: SpacePageType;
}

const PublicSpaceSkeleton: React.FC<PublicSpaceSkeletonProps> = ({
  isTokenPage = false,
  spaceOwnerFid,
  pageType,
}) => {
  const hasProfile = !isTokenPage && !!spaceOwnerFid && pageType !== "proposal";
  return (
    <div className="user-theme-background w-full h-full relative flex-col">
      <div className="w-full transition-all duration-100 ease-out">
        <div className="flex flex-col h-full">
          <TabBarSkeleton />
          <div className="flex h-full">
            <div className="grow">
              <SpaceLoading hasProfile={hasProfile} hasFeed={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSpaceSkeleton;
