"use client";

import React, { useMemo } from "react";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ChannelSpacePageData } from "@/common/types/spaceData";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";

export interface ChannelSpaceProps {
  spacePageData: Omit<ChannelSpacePageData, "isEditable" | "spacePageUrl">;
  tabName: string;
}

const isChannelSpaceEditable = (
  moderatorFids: number[],
  currentUserFid: number | undefined,
  spaceId: string | undefined,
  spaceIdentityPublicKey?: string,
  currentUserIdentityPublicKey?: string,
) => {
  const hasModeratorPrivileges =
    currentUserFid !== undefined &&
    moderatorFids.includes(currentUserFid);

  const hasIdentityOwnership =
    !!(
      spaceId &&
      spaceIdentityPublicKey &&
      currentUserIdentityPublicKey &&
      spaceIdentityPublicKey === currentUserIdentityPublicKey
    );

  return hasModeratorPrivileges || hasIdentityOwnership;
};

export default function ChannelSpace({ spacePageData, tabName }: ChannelSpaceProps) {
  const currentUserIdentityPublicKey = useCurrentSpaceIdentityPublicKey();

  const spaceDataWithClientLogic = useMemo(() => ({
    ...spacePageData,
    spacePageUrl: (tab: string) => `/c/${spacePageData.channelId}/${encodeURIComponent(tab)}`,
    isEditable: (currentUserFid: number | undefined) =>
      isChannelSpaceEditable(
        spacePageData.moderatorFids,
        currentUserFid,
        spacePageData.spaceId,
        spacePageData.identityPublicKey,
        currentUserIdentityPublicKey,
      ),
  }), [spacePageData, currentUserIdentityPublicKey]);

  return (
    <PublicSpace
      spacePageData={spaceDataWithClientLogic}
      tabName={tabName}
    />
  );
}
