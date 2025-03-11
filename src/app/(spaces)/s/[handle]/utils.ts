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
      return null;
    }
  },
);

export const getTabList = cache(async (fid: number): Promise<Tab[]> => {
  try {
    const { data, error } = await supabaseClient
    .from("spaceRegistrations")
    .select("spaceId")
    .eq("fid", fid);

    if (isEmpty(data)) {
      return [];
    }

    return data as Tab[];
  } catch (e) {
    return [];
  }
});
