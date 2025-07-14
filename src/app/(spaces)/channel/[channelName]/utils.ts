import axiosBackend from "@/common/data/api/backend";
import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { unstable_noStore as noStore } from "next/cache";

export type Tab = { spaceId: string; spaceName: string };

export interface ChannelMetadata {
  id: string;
  name: string;
  leadFid?: number | null;
}

export const getChannelMetadata = async (
  channelName: string,
): Promise<ChannelMetadata | null> => {
  try {
    const { data } = await axiosBackend.get("/api/farcaster/neynar/channel", {
      params: { id: channelName },
    });
    const ch = data.channel;
    return {
      id: ch.id,
      name: ch.name,
      leadFid: ch.lead_fid ?? ch.owner_fid ?? ch.host_fid ?? null,
    } as ChannelMetadata;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getTabList = async (channelName: string): Promise<Tab[]> => {
  noStore();
  try {
    const { data: registrations, error } = await createSupabaseServerClient()
      .from("spaceRegistrations")
      .select("spaceId, spaceName")
      .eq("spaceName", channelName)
      .limit(1);
    if (error) {
      console.error("Error fetching space registration:", error);
      return [];
    }
    if (!registrations || registrations.length === 0) {
      return [];
    }
    const registration = registrations[0];
    try {
      const { data: tabOrderData, error: storageError } =
        await createSupabaseServerClient()
          .storage
          .from("spaces")
          .download(`${registration.spaceId}/tabOrder`);
      if (storageError || !tabOrderData) {
        return [registration];
      }
      const tabOrderText = await tabOrderData.text();
      const tabOrderJson = JSON.parse(tabOrderText);
      const enhancedTab = {
        ...registration,
        order: tabOrderJson.tabOrder || [],
        updatedAt: tabOrderJson.timestamp || new Date().toISOString(),
      };
      return [enhancedTab];
    } catch (e) {
      return [registration];
    }
  } catch (e) {
    console.error("Exception in getTabList:", e);
    return [];
  }
};
