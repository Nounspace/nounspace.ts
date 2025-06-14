import React from "react";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import TextInput from "@/common/components/molecules/TextInput";
import { useQuery } from "@tanstack/react-query";
import axiosBackend from "@/common/data/api/backend";
import { ChannelResponse } from "@neynar/nodejs-sdk/build/api";
import { BsChatLeft, BsChatLeftFill } from "react-icons/bs";

export type ChannelFidgetSettings = { channel: string };

const channelProperties: FidgetProperties<ChannelFidgetSettings> = {
  fidgetName: "Channel",
  icon: 0x1f4ac,
  mobileIcon: <BsChatLeft size={24} />,
  mobileIconSelected: <BsChatLeftFill size={24} />,
  fields: [
    { fieldName: "channel", default: "", required: true, inputSelector: TextInput },
  ],
  size: { minHeight: 3, maxHeight: 36, minWidth: 4, maxWidth: 36 },
};

const useChannelInfo = (name: string) =>
  useQuery({
    queryKey: ["channel-info", name],
    enabled: !!name,
    staleTime: 1000 * 60,
    queryFn: async () => {
      const { data } = await axiosBackend.get<ChannelResponse>(
        "/api/farcaster/neynar/channel",
        { params: { channel_id: name } },
      );
      return data.channel;
    },
  });

const Channel: React.FC<FidgetArgs<ChannelFidgetSettings>> = ({ settings: { channel } }) => {
  const { data } = useChannelInfo(channel);
  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {data.image_url && (
          <img src={data.image_url} className="w-12 h-12 rounded" />
        )}
        <div className="flex flex-col">
          <span className="text-xl font-bold">{data.name || channel}</span>
          <small className="text-slate-500">/{data.id}</small>
        </div>
      </div>
      {data.description && <p className="text-sm mt-2">{data.description}</p>}
      <div className="text-sm flex gap-4 mt-2">
        {data.member_count !== undefined && <span>{data.member_count} Members</span>}
        {data.follower_count !== undefined && <span>{data.follower_count} Followers</span>}
      </div>
      {data.external_link?.url && (
        <a
          href={data.external_link.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          {data.external_link.url}
        </a>
      )}
      <a
        className="mt-2 inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded self-start"
        href={`https://warpcast.com/~/channel/${data.id}`}
        target="_blank"
        rel="noreferrer"
      >
        Follow
      </a>
    </div>
  );
};

export default { fidget: Channel, properties: channelProperties } as FidgetModule<FidgetArgs<ChannelFidgetSettings>>;
