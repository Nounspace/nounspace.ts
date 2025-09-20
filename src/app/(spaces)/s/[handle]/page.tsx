import React from "react";
import { loadUserSpaceData } from "./utils";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import ProfileSpace from "./ProfileSpace";

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

  const profileSpaceData = await loadUserSpaceData(handle, decodedTabNameParam);

  if (!profileSpaceData) {
    return <SpaceNotFound />;
  }

  return (
    <ProfileSpace
      spaceData={profileSpaceData}
      tabName={profileSpaceData.config.tabNames?.[0] || "Profile"}
    />
  );
};

export default ProfileSpacePage;
