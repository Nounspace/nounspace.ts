import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { UserMetadata } from "@/common/lib/utils/userMetadata";
import neynar from "@/common/data/api/neynar";
import { unstable_noStore as noStore } from "next/cache";
import { ProfileSpaceData, SPACE_TYPES } from "@/common/types/spaceData";
import createIntialPersonSpaceConfigForFid from "@/constants/initialPersonSpace";

export type Tab = {
  spaceId: string;
  spaceName: string;
};

export const getUserMetadata = async (
  handle: string,
): Promise<UserMetadata | null> => {
  try {
    // Check if response is valid before destructuring
    const response = await neynar.lookupUserByUsername({ username: handle });
    
    // Validate response has expected structure
    if (!response || typeof response !== 'object' || !('user' in response)) {
      console.error('Invalid response from Neynar API:', response);
      return null;
    }
    
    const { user } = response;
    
    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      bio: user.profile?.bio?.text || "",
    };
  } catch (e) {
    console.error('Error fetching user metadata:', e);
    return null;
  }
};

export const getTabList = async (fid: number): Promise<Tab[]> => {

  try {
    // Add timestamp to bust cache
    const { data: registrations, error: regError } = await createSupabaseServerClient()
      .from("spaceRegistrations")
      .select('spaceId, spaceName, fid')
      .eq('fid', fid)
      .limit(1)
    
    if (regError) {
      console.error("Error fetching space registration:", regError);
      return [];
    }
    
    if (!registrations || registrations.length === 0) {
      return [];
    }

    // Get the first registration (there should only be one per fid)
    const registration = registrations[0];

    try {
      // Get the tab order file directly from storage
      const { data: tabOrderData, error: storageError } = await createSupabaseServerClient()
        .storage
        .from("spaces")
        .download(`${registration.spaceId}/tabOrder`);

      if (storageError || !tabOrderData) {
        console.warn(`No tab order found for space ${registration.spaceId}:`, storageError);
        return [registration];
      }

      // Convert the blob to text and parse as JSON
      const tabOrderText = await tabOrderData.text();
      const tabOrderJson = JSON.parse(tabOrderText);
      
      const enhancedTab = {
        ...registration,
        order: tabOrderJson.tabOrder || [],
        updatedAt: tabOrderJson.timestamp || new Date().toISOString(),
      };

      return [enhancedTab];
    } catch (e) {
      console.warn(`Error fetching tab order for space ${registration.spaceId}:`, e);
      return [registration];
    }
  } catch (e) {
    console.error("Exception in getTabList:", e);
    return [];
  }
};

// Profile space specific creator
export const createProfileSpaceData = (
  spaceId: string | undefined,
  spaceName: string,
  fid: number,
  tabName: string
): Omit<ProfileSpaceData, 'isEditable' | 'spacePageUrl'> => {
  const config = {
    ...createIntialPersonSpaceConfigForFid(fid, spaceName),
    timestamp: new Date().toISOString(),
  };

  return {
    // Base SpaceData properties
    id: spaceId,
    spaceName,
    spaceType: SPACE_TYPES.PROFILE,
    updatedAt: new Date().toISOString(),
    config,
    // ProfileSpaceData specific properties
    fid,
  };
};

export const loadUserSpaceData = async (
  handle: string,
  tabNameParam?: string
): Promise<Omit<ProfileSpaceData, 'isEditable' | 'spacePageUrl'> | null> => {
  noStore(); 

  const userMetadata = await getUserMetadata(handle);
  const spaceOwnerFid = userMetadata?.fid || undefined;
  const spaceOwnerUsername = userMetadata?.username || undefined;

  if (!spaceOwnerFid) {
    return null;
  }

  // Check if space already exists in database
  let spaceId: string | undefined;
  const tabList = await getTabList(spaceOwnerFid);
  if (tabList && tabList.length > 0) {
    spaceId = tabList[0].spaceId;
  }

  const tabName = tabNameParam || spaceOwnerUsername || "Profile";

  return createProfileSpaceData(
    spaceId, // This can be undefined if space doesn't exist yet
    spaceOwnerUsername || "Profile",
    spaceOwnerFid,
    tabName
  );
};
