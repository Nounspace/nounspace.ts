"use client";

import React, { useEffect, useMemo } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

import PublicSpace from "@/app/(spaces)/PublicSpace";
import type { SpacePageData } from "@/common/types/spaceData";

type ExploreTabPageProps = {
  tabName: string;
  spacePageData: Omit<SpacePageData, "isEditable" | "spacePageUrl">;
};

const ExploreTabPage: React.FC<ExploreTabPageProps> = ({ tabName, spacePageData }) => {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  const hydratedSpaceData = useMemo(() => ({
    ...spacePageData,
    spacePageUrl: (nextTab: string) => `/explore/${encodeURIComponent(nextTab)}`,
    isEditable: (currentUserFid?: number) => {
      if (!spacePageData.spaceOwnerFid) {
        return false;
      }
      return currentUserFid === spacePageData.spaceOwnerFid;
    },
  }), [spacePageData]);

  return <PublicSpace spacePageData={hydratedSpaceData} tabName={tabName} />;
};

export default ExploreTabPage;
