import axiosBackend from "@/common/data/api/backend";
import { unstable_noStore as noStore } from "next/cache";
import { ChannelSpaceData, SPACE_TYPES } from "@/common/types/spaceData";
import createInitialChannelSpaceConfigForName from "@/constants/initialChannelSpace";

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
      params: { id: channelName.toLowerCase() },
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

export const createChannelSpaceData = (
  spaceId: string,
  spaceName: string,
  channelName: string,
  channelId: string,
  spaceOwnerFid?: number,
  tabName?: string,
): Omit<ChannelSpaceData, 'isEditable' | 'spacePageUrl'> => {
  const config = createInitialChannelSpaceConfigForName(channelName);
  
  return {
    spaceId,
    spaceName,
    spaceType: SPACE_TYPES.CHANNEL,
    updatedAt: new Date().toISOString(),
    defaultTab: "Channel",
    config,
    channelName: channelName.toLowerCase(),
    channelId,
    spaceOwnerFid,
  };
};

export const loadChannelSpaceData = async (
  channelName: string,
  tabNameParam?: string,
): Promise<Omit<ChannelSpaceData, 'isEditable' | 'spacePageUrl'> | null> => {
  noStore();
  
  const channelMetadata = await getChannelMetadata(channelName);
  if (!channelMetadata) {
    return null;
  }

  const spaceId = `channel-${channelMetadata.id}`;
  const spaceName = channelMetadata.name;
  const spaceOwnerFid = channelMetadata.leadFid ?? undefined;

  return createChannelSpaceData(
    spaceId,
    spaceName,
    channelName,
    channelMetadata.id,
    spaceOwnerFid,
    tabNameParam,
  );
};
