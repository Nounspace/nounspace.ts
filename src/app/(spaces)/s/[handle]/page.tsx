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
  console.log("Starting loadUserSpaceData for handle:", handle);
  
  const userMetadata = await getUserMetadata(handle);
  console.log("User metadata result:", userMetadata);
  const fid = userMetadata?.fid || null;
  console.log("Extracted FID:", fid);

  if (!fid) {
    console.log("No FID found, returning null values");
    return { fid: null, spaceId: null, tabName: null };
  }

  const tabList = await getTabList(fid);
  console.log("Tab list result:", tabList);
  
  if (!tabList || tabList.length === 0) {
    console.log("No tab list found, returning null spaceId and tabName");
    return { fid, spaceId: null, tabName: null };
  }

  const defaultTab: Tab = tabList[0];
  console.log("Default tab:", defaultTab);

  const spaceId = defaultTab.spaceId;
  const tabName = tabNameParam || defaultTab.spaceName;
  console.log("Final values - spaceId:", spaceId, "tabName:", tabName);

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
  console.log("ProfileSpacePage rendering with params:", { handle, tabNameParam });

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

  console.log("ProfileSpacePage data loaded:", { fid, spaceId, tabName });

  return <ProfileSpace fid={fid} spaceId={spaceId} tabName={tabName} />;
};

export default ProfileSpacePage;
