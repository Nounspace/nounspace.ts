import React from "react";
import { getTabList, getUserMetadata, type Tab } from "./utils";
import ProfileSpace, { UserDefinedSpacePageProps } from "./ProfileSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { unstable_noStore as noStore } from "next/cache";


const loadUserSpaceData = async (
  handle: string,
  tabNameParam?: string
): Promise<UserDefinedSpacePageProps> => {
  noStore(); 

  const userMetadata = await getUserMetadata(handle);
  const spaceOwnerFid = userMetadata?.fid || null;
  const spaceOwnerUsername = userMetadata?.username || null;

  if (!spaceOwnerFid) {
    return {
      spaceOwnerFid: null,
      spaceOwnerUsername: null,
      spaceId: undefined,
      tabName: null,
    };
  }

  const tabList = await getTabList(spaceOwnerFid);

  if (!tabList || tabList.length === 0) {
    return { spaceOwnerFid, spaceOwnerUsername, spaceId: undefined, tabName: null };
  }

  const defaultTab: Tab = tabList[0];

  const spaceId = defaultTab.spaceId;
  const tabName = tabNameParam || defaultTab.spaceName;

  return { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName };
};

const ProfileSpacePage = async ({
  params,
}: {
  params: Promise<{ handle: string; tabName?: string }>
}) => {
  const { handle, tabName: tabNameParam } = await params;

  if (!handle) {
    return <SpaceNotFound />;
  }

  let decodedTabNameParam = tabNameParam;
  if (tabNameParam) {
    decodedTabNameParam = decodeURIComponent(tabNameParam);
  }

  const { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName } =
    await loadUserSpaceData(handle, decodedTabNameParam);

  return (
    <ProfileSpace
      spaceOwnerFid={spaceOwnerFid}
      spaceOwnerUsername={spaceOwnerUsername}
      spaceId={spaceId}
      tabName={tabName}
    />
  );
};

export default ProfileSpacePage;
