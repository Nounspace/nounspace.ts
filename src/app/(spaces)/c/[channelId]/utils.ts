import { createSupabaseServerClient } from "@/common/data/database/supabase/clients/server";
import neynar from "@/common/data/api/neynar";
import { unstable_noStore as noStore } from "next/cache";
import {
  ChannelSpacePageData,
  SPACE_TYPES,
} from "@/common/types/spaceData";
import createInitialChannelSpaceConfig from "@/config/spaces/initialChannelSpace";
import { Channel, ChannelType } from "@neynar/nodejs-sdk/build/api";

export const getChannelMetadata = async (
  channelId: string,
): Promise<Channel | null> => {
  try {
    const { channel } = await neynar.lookupChannel({
      id: channelId,
      type: ChannelType.Id,
    });
    return channel;
  } catch (error) {
    console.error("Error fetching channel metadata:", error);
    return null;
  }
};

export const createChannelSpaceData = (
  spaceId: string | undefined,
  channelId: string,
  channelDisplayName: string | undefined,
  moderatorFids: number[],
  tabName: string,
  identityPublicKey?: string,
): Omit<ChannelSpacePageData, "isEditable" | "spacePageUrl"> => {
  const config = {
    ...createInitialChannelSpaceConfig(channelId),
    timestamp: new Date().toISOString(),
  };

  return {
    spaceId,
    spaceName: channelId,
    spaceType: SPACE_TYPES.CHANNEL,
    updatedAt: new Date().toISOString(),
    defaultTab: "Channel",
    currentTab: tabName,
    config,
    spaceOwnerFid: moderatorFids[0],
    channelId,
    channelDisplayName,
    moderatorFids,
    identityPublicKey,
  };
};

export const loadChannelSpaceRegistration = async (
  channelId: string,
): Promise<{
  spaceId?: string;
  identityPublicKey?: string;
  fid?: number | null;
} | null> => {
  noStore();
  try {
    const { data, error } = await createSupabaseServerClient()
      .from("spaceRegistrations")
      .select("spaceId, identityPublicKey, fid")
      .eq("channelId", channelId)
      .order("timestamp", { ascending: true })
      .limit(1);

    if (error) {
      console.error("Error fetching channel space registration:", error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Exception in loadChannelSpaceRegistration:", error);
    return null;
  }
};

export const loadChannelSpaceData = async (
  channelId: string,
  tabNameParam?: string,
): Promise<Omit<ChannelSpacePageData, "isEditable" | "spacePageUrl"> | null> => {
  noStore();

  const channelMetadata = await getChannelMetadata(channelId);

  if (!channelMetadata) {
    return null;
  }

  const registration = await loadChannelSpaceRegistration(channelId);
  const spaceId = registration?.spaceId;
  const identityPublicKey = registration?.identityPublicKey;

  const tabName = tabNameParam || "Channel";

  return createChannelSpaceData(
    spaceId,
    channelId,
    channelMetadata.name,
    channelMetadata.moderator_fids || [],
    tabName,
    identityPublicKey,
  );
};
