import React from "react";
import { getTabList, getUserMetadata, type Tab } from "./utils";
import ProfileSpace, {
  UserDefinedSpacePageProps,
} from "./ProfileSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { Metadata } from "next/types";
import { getUserMetadataStructure } from "@/common/lib/utils/userMetadata";
import { unstable_noStore as noStore } from 'next/cache';
import { WEBSITE_URL } from "@/constants/app";
const loadUserSpaceData = async (
  handle: string,
  tabNameParam?: string,
): Promise<UserDefinedSpacePageProps> => {
  noStore();

  console.log("Starting loadUserSpaceData for handle:", handle);
  
  const userMetadata = await getUserMetadata(handle);
  console.log("User metadata result:", userMetadata);
  const spaceOwnerFid = userMetadata?.fid || null;
  const spaceOwnerUsername = userMetadata?.username || null;
  console.log("Extracted FID:", spaceOwnerFid);

  if (!spaceOwnerFid) {
    console.log("No FID found, returning null values");
    return { spaceOwnerFid: null, spaceOwnerUsername: null, spaceId: null, tabName: null };
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

export async function generateMetadata({
  params: { handle, tabName: tabNameParam },
}): Promise<Metadata> {
  if (!handle) {
    return {};
  }

  const userMetadata = await getUserMetadata(handle);
  if (!userMetadata) {
    return {};
  }

  // Process tabName parameter if it exists
  const tabName = tabNameParam ? decodeURIComponent(tabNameParam) : undefined;
  
  // Create Frame metadata for Farcaster with the correct path
  const frameUrl = tabName 
    ? `${WEBSITE_URL}/s/${handle}/${encodeURIComponent(tabName)}`
    : `${WEBSITE_URL}/s/${handle}`;
    
  const displayName = userMetadata?.displayName || userMetadata?.username || handle;
  
  const spaceFrame = {
    version: "next",
    imageUrl: `${WEBSITE_URL}/images/nounspace_og.png`,
    button: {
      title: `Visit ${displayName}'s Space`,
      action: {
        type: "launch_frame",
        url: frameUrl,
        name: `${displayName}'s Nounspace`,
        splashImageUrl: `${WEBSITE_URL}/images/nounspace_logo.png`,
        splashBackgroundColor: "#FFFFFF",
      }
    }
  };

  const baseMetadata = getUserMetadataStructure(userMetadata);
  
  // Type-safe way to add frame metadata
  const metadataWithFrame = {
    ...baseMetadata,
    title: `${displayName}'s Space | Nounspace`,
    description: userMetadata?.bio || 
      `${displayName}'s customized space on Nounspace, the customizable web3 social app built on Farcaster.`,
  };
  
  // Add the fc:frame metadata
  if (!metadataWithFrame.other) {
    metadataWithFrame.other = {};
  }
  
  metadataWithFrame.other['fc:frame'] = JSON.stringify(spaceFrame);
  
  return metadataWithFrame;
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

  const { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName } = await loadUserSpaceData(
    handle,
    tabNameParam,
  );

  console.log("ProfileSpacePage data loaded:", { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName });

  return <ProfileSpace 
    spaceOwnerFid={spaceOwnerFid} 
    spaceOwnerUsername={spaceOwnerUsername} 
    spaceId={spaceId} 
    tabName={tabName} 
  />;
};

export default ProfileSpacePage;
