import neynar from "@/common/data/api/neynar";
import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { unstable_noStore as noStore } from "next/cache";
import { Channel } from "@neynar/nodejs-sdk/build/api";

export type Tab = { spaceId: string; spaceName: string };

export const getChannelMetadata = async (
  channelName: string,
): Promise<{ fid: number | null; name: string }> => {
  try {
    const { channel } = await neynar.lookupChannel({ id: channelName });
    return { fid: channel.lead?.fid ?? null, name: channel.name || channel.id };
  } catch {
    return { fid: null, name: channelName };
  }
};

export const getTabList = async (
  fid: number,
  channelName: string,
): Promise<Tab[]> => {
  noStore();
  try {
    const { data: registrations, error } = await createSupabaseServerClient()
      .from("spaceRegistrations")
      .select("spaceId, spaceName, fid")
      .eq("fid", fid)
      .eq("spaceName", channelName)
      .limit(1);
    if (error || !registrations || registrations.length === 0) {
      return [];
    }
    const registration = registrations[0];
    return [registration];
  } catch {
    return [];
  }
};
