import neynar from "@/common/data/api/neynar";
import supabaseClient from "@/common/data/database/supabase/clients/server";
import { UserMetadata } from "@/common/lib/utils/userMetadata";
import { isEmpty } from "lodash";
import { cache } from "react";

export type Tab = {
  spaceId: string;
  spaceName: string;
};

export const getUserMetadata = cache(
  async (handle: string): Promise<UserMetadata | null> => {
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
  },
);

export const getTabList = async (fid: number): Promise<Tab[]> => {
  try {
    // console.log("Getting tablist for fid:", fid, "type:", typeof fid);
    
    // Let's try with explicit column names as shown in the schema
    const { data, error } = await supabaseClient
      .from("spaceRegistrations")
      .select('"spaceId","spaceName"')
      .eq('fid', fid);
    
    // console.log("supabase tabList response: ", data, error ? error.message : "no error");

    if (error) {
      console.error("Error fetching tabs:", error);
      return [];
    }

    if (!data || isEmpty(data)) {
      // console.log("No data found for fid:", fid);
      return [];
    }

    return data as Tab[];
  } catch (e) {
    console.error("Exception in getTabList:", e);
    return [];
  }
};
