import React from "react";
import { getTabList, getUserMetadata, type Tab } from "./utils";
import ProfileSpace, { UserDefinedSpacePageProps } from "./ProfileSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { unstable_noStore as noStore } from "next/cache";

const cache = new Map<string, UserDefinedSpacePageProps>();

const loadUserSpaceData = async (
  handle: string,
  tabNameParam?: string
): Promise<UserDefinedSpacePageProps> => {
  const cacheKey = `${handle}-${tabNameParam || "default"}`;
  if (cache.has(cacheKey)) {
    console.log("Cache hit for", cacheKey);
    return cache.get(cacheKey)!;
  }

  noStore();

  console.log("Starting loadUserSpaceData for handle:", handle);

  const userMetadata = await getUserMetadata(handle);
  const spaceOwnerFid = userMetadata?.fid || null;
  const spaceOwnerUsername = userMetadata?.username || null;

  if (!spaceOwnerFid) {
    console.log("No FID found, returning null values");
    const result = {
      spaceOwnerFid: null,
      spaceOwnerUsername: null,
      spaceId: null,
      tabName: null,
    };
    cache.set(cacheKey, result);
    return result;
  }

  const tabList = await getTabList(spaceOwnerFid);
  console.log("Tab list result:", tabList);

  if (!tabList || tabList.length === 0) {
    console.log("No tab list found, returning null spaceId and tabName");
    const result = { spaceOwnerFid, spaceOwnerUsername, spaceId: null, tabName: null };
    cache.set(cacheKey, result);
    return result;
  }

  const defaultTab: Tab = tabList[0];
  console.log("Default tab:", defaultTab);

  const spaceId = defaultTab.spaceId;
  const tabName = tabNameParam || defaultTab.spaceName;
  console.log("Final values - spaceId:", spaceId, "tabName:", tabName);

  const result = { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName };
  cache.set(cacheKey, result);
  return result;
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
