import neynar from "@/common/data/api/neynar";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { UserMetadata } from "@/common/lib/utils/userMetadata";
import { isEmpty } from "lodash";
import { cache } from "react";

export type Tab = {
  spaceId: string;
  spaceName: string;
};

export const getUserMetadata = async (handle: string): Promise<UserMetadata | null> => {
  try {
    const {
      result: { user },
    } = await neynar.lookupUserByUsername(handle);

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.displayName,
      pfpUrl: user.pfp.url,
      bio: user.profile.bio.text,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getTabList = async (fid: number): Promise<Tab[]> => {
  try {
    console.log("Getting tablist for fid:", fid, "type:", typeof fid);
    
    // Get the space registration
    const { data: registrations, error: regError } = await supabaseClient
      .from("spaceRegistrations")
      .select('spaceId, spaceName')
      .eq('fid', fid);
    
    if (regError) {
      console.error("Error fetching space registration:", regError);
      return [];
    }

    if (!registrations || registrations.length === 0) {
      console.log("No space registration found for fid:", fid);
      return [];
    }

    // Get the first registration (there should only be one per fid)
    const registration = registrations[0];

    try {
      // Get the public URL for the tab order file
      const { data: { publicUrl } } = await supabaseClient.storage
        .from("spaces")
        .getPublicUrl(`${registration.spaceId}/tabOrder`);

      // Add cache-busting parameter
      const t = Math.random().toString(36).substring(2);
      const urlWithParam = `${publicUrl}?t=${t}`;

      // Fetch the tab order
      const response = await fetch(urlWithParam, {
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });

      if (!response.ok) {
        console.warn(`No tab order found for space ${registration.spaceId}`);
        return [registration];
      }

      const tabOrderData = await response.json();
      const enhancedTab = {
        ...registration,
        order: tabOrderData.tabOrder || [],
        updatedAt: tabOrderData.timestamp || new Date().toISOString(),
      };

      console.log("Successfully retrieved tab with order:", enhancedTab);
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
