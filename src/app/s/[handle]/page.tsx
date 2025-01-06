import React from "react";
import { first } from "lodash";
import { getTabList, getUserMetadata, type Tab } from "./utils";
import UserPrimarySpace, { SpacePageProps } from "./UserPrimarySpace";
import SpaceNotFound from "@/common/components/pages/SpaceNotFound";
import { UserSpaceProvider } from "./context";

const loadUserSpaceData = async (handle: string): Promise<SpacePageProps> => {
  const userMetadata = await getUserMetadata(handle);
  const fid = userMetadata?.fid || null;
  let spaceId: number | null = null;
  let tabName: string | null = null;

  if (fid) {
    const tabList = await getTabList(fid);
    const defaultTab: Tab | undefined = first(tabList);

    spaceId = defaultTab?.spaceId ?? null;
    tabName = defaultTab?.spaceName ?? null;
  }

  console.log("2 ===", fid, spaceId, tabName);

  return { fid, spaceId, tabName };
};

const UserPrimarySpacePage = ({ params: { handle } }) => {
  if (!handle) {
    return <SpaceNotFound />;
  }

  const loadUserSpacePromise = loadUserSpaceData(handle);

  return (
    <UserSpaceProvider userSpacePromise={loadUserSpacePromise}>
      <UserPrimarySpace />
    </UserSpaceProvider>
  );
};

export default UserPrimarySpacePage;
