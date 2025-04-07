import React from "react";
import { getTabList, getUserMetadata, type Tab } from "./utils";
import ProfileSpace, {
  UserDefinedSpacePageProps,
} from "./ProfileSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { Metadata } from "next/types";
import { getUserMetadataStructure } from "@/common/lib/utils/userMetadata";

const loadUserSpaceData = async (
  handle: string,
  tabNameParam?: string,
): Promise<UserDefinedSpacePageProps> => {

  // console.log("loading user space data for handle: ", handle);
  const userMetadata = await getUserMetadata(handle);
  const fid = userMetadata?.fid || null;

  if (!fid) {
    return { fid: null, spaceId: null, tabName: null };
  }

  const tabList = await getTabList(fid);
  if (!tabList || tabList.length === 0) {
    return { fid, spaceId: null, tabName: null };
  }

  const defaultTab: Tab = tabList[0];

  const spaceId = defaultTab.spaceId;
  const tabName = tabNameParam || defaultTab.spaceName;

  return { fid, spaceId, tabName };
};

export async function generateMetadata({
  params: { handle },
}): Promise<Metadata> {
  if (!handle) {
    return {};
  }

  const userMetadata = await getUserMetadata(handle);
  if (!userMetadata) {
    return {};
  }

  return getUserMetadataStructure(userMetadata);
}

const ProfileSpacePage = async ({
  params: { handle, tabName: tabNameParam },
}) => {
  if (!handle) {
    return <SpaceNotFound />;
  }

  if (tabNameParam) {
    tabNameParam = decodeURIComponent(tabNameParam);
  }

  const { fid, spaceId, tabName } = await loadUserSpaceData(
    handle,
    tabNameParam,
  );

  return <ProfileSpace fid={fid} spaceId={spaceId} tabName={tabName} />;
};

export default ProfileSpacePage;
