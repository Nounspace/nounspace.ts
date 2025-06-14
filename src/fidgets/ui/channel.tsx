import { Button } from "@/common/components/atoms/button";
import TextInput from "@/common/components/molecules/TextInput";
import { useQuery } from "@tanstack/react-query";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import axiosBackend from "@/common/data/api/backend";
import { Channel } from "@mod-protocol/farcaster";
import { useFarcasterSigner } from "../farcaster";
import { followUser } from "../farcaster/utils";

export type ChannelFidgetSettings = {
  channel: string;
};

const channelProperties: FidgetProperties = {
  fidgetName: "Channel",
  icon: 0x1f4e2,
  fields: [
    { fieldName: "channel", default: "", required: true, inputSelector: TextInput },
  ],
  size: {
    minHeight: 3,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
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

const Channel: React.FC<FidgetArgs<ChannelFidgetSettings>> = ({ settings }) => {
  const { channel } = settings;
  const { data } = useChannelInfo(channel);
  const { signer, fid } = useFarcasterSigner("channel-info");

  if (!data) {
    return <div className="p-4">Loading...</div>;
  }

  const handleFollow = async () => {
    if (data?.host && signer && fid) {
      await followUser(Number(data.host.fid), fid, signer);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {data.image_url && (
          <img src={data.image_url} className="h-16 w-16 rounded" />
        )}
        <div className="flex flex-col">
          <span className="text-xl font-bold">{data.name}</span>
          <span className="text-sm text-muted-foreground">/{data.id}</span>
        </div>
      </div>
      {data.description && <p className="text-sm">{data.description}</p>}
      {data.parent_url && (
        <a
          href={data.parent_url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          {data.parent_url}
        </a>
      )}
      <div className="flex gap-4 text-sm">
        <span>{data.member_count} Members</span>
        <span>{data.followers} Followers</span>
      </div>
      {data.host && (
        <Button className="w-fit" onClick={handleFollow} variant="secondary">
          Follow
        </Button>
      )}
    </div>
  );
};

export default {
  fidget: Channel,
  properties: channelProperties,
} as FidgetModule<FidgetArgs<ChannelFidgetSettings>>;
