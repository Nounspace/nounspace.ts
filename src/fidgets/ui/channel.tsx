import { Button } from "@/common/components/atoms/button";
import TextInput from "@/common/components/molecules/TextInput";
import axiosBackend from "@/common/data/api/backend";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import { Channel } from "@mod-protocol/farcaster";
import { useQuery } from "@tanstack/react-query";
import { isUndefined } from "lodash";
import React from "react";

export type ChannelInfoFidgetSettings = { name: string };

const properties: FidgetProperties = {
  fidgetName: "Channel",
  icon: 0x1f4e2,
  fields: [
    { fieldName: "name", default: "", required: true, inputSelector: TextInput },
    ...defaultStyleFields,
  ],
  size: { minHeight: 3, maxHeight: 36, minWidth: 4, maxWidth: 36 },
};

const useChannelInfo = (name: string) => {
  return useQuery({
    queryKey: ["channel-info", name],
    enabled: !!name,
    queryFn: async () => {
      const { data } = await axiosBackend.get<{ channel: Channel }>(
        "/api/farcaster/neynar/channel",
        { params: { id: name } },
      );
      return data.channel;
    },
  });
};

const ChannelInfo: React.FC<FidgetArgs<ChannelInfoFidgetSettings>> = ({
  settings: { name },
}) => {
  const { data: channel } = useChannelInfo(name);

  if (isUndefined(channel)) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {channel.image_url && (
          <img src={channel.image_url} alt={channel.name} className="h-10 w-10 rounded" />
        )}
        <div className="flex flex-col">
          <span className="font-bold">{channel.display_name}</span>
          <span className="text-sm opacity-70">/{channel.name}</span>
        </div>
      </div>
      {channel.description && <p className="text-sm">{channel.description}</p>}
      <div className="text-sm opacity-70 flex gap-4">
        <span>{channel.following_count} members</span>
        <span>{channel.follower_count} followers</span>
      </div>
      {channel.parent_url && (
        <a
          href={channel.parent_url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline text-sm"
        >
          {channel.parent_url}
        </a>
      )}
      <div>
        <Button asChild size="sm">
          <a
            href={`https://warpcast.com/~/channel/${channel.name}`}
            target="_blank"
            rel="noreferrer"
          >
            Follow
          </a>
        </Button>
      </div>
    </div>
  );
};

export default {
  fidget: ChannelInfo,
  properties,
} as FidgetModule<FidgetArgs<ChannelInfoFidgetSettings>>;
