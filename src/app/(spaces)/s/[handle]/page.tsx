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

  console.log("Starting loadUserSpaceData for handle:", handle);

  const userMetadata = await getUserMetadata(handle);
  // console.log("User metadata result:", userMetadata);
  const spaceOwnerFid = userMetadata?.fid || null;
  const spaceOwnerUsername = userMetadata?.username || null;
  // console.log("Extracted FID:", spaceOwnerFid);

  if (!spaceOwnerFid) {
    console.log("No FID found, returning null values");
    return {
      spaceOwnerFid: null,
      spaceOwnerUsername: null,
      spaceId: null,
      tabName: null,
    };
  }

  const tabList = await getTabList(spaceOwnerFid);
  console.log("Tab list result:", tabList);

  if (!tabList || tabList.length === 0) {
    console.log("No tab list found, returning null spaceId and tabName");
    return { spaceOwnerFid, spaceOwnerUsername, spaceId: null, tabName: null };
  }

  const defaultTab: Tab = tabList[0];
  console.log("Default tab:", defaultTab);

  const spaceId = defaultTab.spaceId;
  const tabName = tabNameParam || defaultTab.spaceName;
  console.log("Final values - spaceId:", spaceId, "tabName:", tabName);

  return { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName };
};

const ProfileSpacePage = async ({
  params,
}) => {
  const { handle, tabName: tabNameParam } = await params;
  
  console.log("ProfileSpacePage rendering with params:", {
    handle,
    tabNameParam,
  });

  if (!handle) {
    return <SpaceNotFound />;
  }

  let decodedTabNameParam = tabNameParam;
  if (tabNameParam) {
    decodedTabNameParam = decodeURIComponent(tabNameParam);
  }

  const { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName } =
    await loadUserSpaceData(handle, decodedTabNameParam);

  console.log("ProfileSpacePage data loaded:", {
    spaceOwnerFid,
    spaceOwnerUsername,
    spaceId,
    tabName,
  });

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
