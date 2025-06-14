import axiosBackend from "@/common/data/api/backend";
import { ChannelResponse } from "@neynar/nodejs-sdk/build/api";

export const getChannelInfo = async (name: string) => {
  try {
    const { data } = await axiosBackend.get<ChannelResponse>(
      "/api/farcaster/neynar/channel",
      { params: { channel_id: name } },
    );
    return data.channel;
  } catch (e) {
    console.error(e);
    return null;
  }
};
