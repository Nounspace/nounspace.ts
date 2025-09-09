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
      spaceId: null,
      tabName: null,
      spaceIdentityPublicKey: null,
    };
  }

  const tabList = await getTabList(spaceOwnerFid);

  if (!tabList || tabList.length === 0) {
    return { spaceOwnerFid, spaceOwnerUsername, spaceId: null, tabName: null, spaceIdentityPublicKey: null };
  }

  const defaultTab: Tab = tabList[0];

  const spaceId = defaultTab.spaceId;
  const tabName = tabNameParam || defaultTab.spaceName;
  const spaceIdentityPublicKey = defaultTab.identityPublicKey;

  return { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName, spaceIdentityPublicKey };
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

  const { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName, spaceIdentityPublicKey } =
    await loadUserSpaceData(handle, decodedTabNameParam);

  return (
    <ProfileSpace
      spaceOwnerFid={spaceOwnerFid}
      spaceOwnerUsername={spaceOwnerUsername}
      spaceId={spaceId}
      tabName={tabName}
      spaceIdentityPublicKey={spaceIdentityPublicKey}
    />
  );
};

export default ProfileSpacePage;
