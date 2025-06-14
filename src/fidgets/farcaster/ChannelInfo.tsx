import React from "react";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import { Channel } from "@neynar/nodejs-sdk/build/api";
import { useQuery } from "@tanstack/react-query";
import axiosBackend from "@/common/data/api/backend";
import { Button } from "@/common/components/atoms/button";
import TextInput from "@/common/components/molecules/TextInput";

export type ChannelInfoSettings = { channel: string };

const properties: FidgetProperties<ChannelInfoSettings> = {
  fidgetName: "Channel",
  fields: [
    { fieldName: "channel", default: "", required: true, inputSelector: TextInput },
  ],
  icon: 0x1f4e2,
  size: { minHeight: 3, maxHeight: 12, minWidth: 4, maxWidth: 12 },
};

function useChannel(name: string) {
  return useQuery({
    queryKey: ["channel-info", name],
    queryFn: async () => {
      const { data } = await axiosBackend.get(`/api/farcaster/neynar/channel`, { params: { channel_id: name } });
      return (data as { channel: Channel }).channel as Channel;
    },
  });
}

const ChannelInfo: React.FC<FidgetArgs<ChannelInfoSettings>> = ({ settings }) => {
  const { data: channel } = useChannel(settings.channel);

  if (!channel) return <div className="p-4">Loading...</div>;
  return (
    <div className="p-4 space-y-1">
      <div className="font-bold text-lg">{channel.name}</div>
      <div className="text-sm text-gray-500">/{channel.id}</div>
      <div className="text-sm">{channel.description}</div>
      {channel.external_link?.url && (
        <a href={channel.external_link.url} className="text-blue-500" target="_blank" rel="noreferrer">
          {channel.external_link.url}
        </a>
      )}
      <div className="text-sm">{channel.member_count} members · {channel.follower_count} followers</div>
      <Button variant="secondary" size="sm">Follow</Button>
    </div>
  );
};

export default {
  fidget: ChannelInfo,
  properties,
} as FidgetModule<FidgetArgs<ChannelInfoSettings>>;
