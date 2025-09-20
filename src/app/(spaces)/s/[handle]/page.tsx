import React from "react";
import { loadUserSpaceData } from "./utils";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import ProfileSpace from "./ProfileSpace";
import { ProfileSpaceData } from "@/common/types/spaceData";

interface ProfileSpacePageProps {
  params: Promise<{
    handle: string;
    tabName?: string;
  }>;
}

const ProfileSpacePage = async ({ params }: ProfileSpacePageProps) => {
  const { handle, tabName: tabNameParam } = await params;

  if (!handle) {
    return <SpaceNotFound />;
  }

  try {
    let decodedTabNameParam = tabNameParam;
    if (tabNameParam) {
      decodedTabNameParam = decodeURIComponent(tabNameParam);
    }

    const profileSpaceData = await loadUserSpaceData(handle, decodedTabNameParam);

    if (!profileSpaceData) {
      return <SpaceNotFound />;
    }

    console.log("🔍 [1/7] ProfileSpacePage (Server-side) - Initial spaceData loaded from database:", profileSpaceData);

    return (
      <ProfileSpace
        spaceData={profileSpaceData}
        tabName={profileSpaceData.config.tabNames?.[0] || "Profile"}
      />
    );
  } catch (err) {
    console.error("Error loading profile space data:", err);
    return <SpaceNotFound />;
  }
};

export default ProfileSpacePage;
