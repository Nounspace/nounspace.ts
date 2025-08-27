import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { UserMetadata } from "@/common/lib/utils/userMetadata";
import neynar from "@/common/data/api/neynar";

export type Tab = {
  spaceId: string;
  spaceName: string;
};

export const getUserMetadata = async (
  handle: string,
): Promise<UserMetadata | null> => {
  try {
    const { user } = await neynar.lookupUserByUsername({ username: handle });

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name,
      pfpUrl: user.pfp_url,
      bio: user.profile?.bio?.text || "",
    };
  } catch (e) {
    console.error(e);
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
