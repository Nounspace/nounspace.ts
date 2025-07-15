import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/common/components/atoms/button";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import axiosBackend from "@/common/data/api/backend";
import { useQuery } from "@tanstack/react-query";
import { useFarcasterSigner } from "../farcaster";
import { useAppStore } from "@/common/data/stores/app";
import useWalletSignerUUID from "@/common/lib/hooks/useWalletSignerUUID";

export type ChannelFidgetSettings = {
  channel: string;
};

const channelProperties: FidgetProperties = {
  fidgetName: "Channel",
  icon: 0x1f4e2,
  fields: [
    {
      fieldName: "channel",
      default: "",
      required: true,
      inputSelector: TextInput,
    },
  ],
  size: {
    minHeight: 3,
    maxHeight: 36,
    minWidth: 4,
    maxWidth: 36,
  },
};

const useChannelInfo = (channel: string, viewerFid?: number) => {
  return useQuery({
    queryKey: ["channel-info", channel, viewerFid],
    queryFn: async () => {
      const params: Record<string, string | number> = { id: channel };
      if (viewerFid && viewerFid > 0) params.viewer_fid = viewerFid;
      const { data } = await axiosBackend.get(
        "/api/farcaster/neynar/channel",
        { params },
      );
      return data.channel as any;
    },
  });
};

const Channel: React.FC<FidgetArgs<ChannelFidgetSettings>> = ({
  settings: { channel },
}) => {
  const { fid } = useFarcasterSigner("channel-fidget");
  const signerUUID = useWalletSignerUUID();
  const { setModalOpen } = useAppStore((state) => ({
    setModalOpen: state.setup.setModalOpen,
  }));
  const { data } = useChannelInfo(channel, fid);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (data?.viewer_context) {
      setFollowing(data.viewer_context.following);
    }
  }, [data?.viewer_context]);

  const handleToggle = async () => {
    if (!fid || fid <= 0 || !signerUUID) {
      setModalOpen(true);
      return;
    }

    setFollowing((p) => !p);
    try {
      const payload = {
        channel_id: channel,
        signer_uuid: signerUUID,
      };
      if (!following) {
        await axiosBackend.post(
          "/api/farcaster/neynar/channel/follow",
          payload,
        );
      } else {
        await axiosBackend.delete(
          "/api/farcaster/neynar/channel/follow",
          {
            data: payload,
          },
        );
      }
    } catch (_e) {
      setFollowing((p) => !p);
    }
  };

  const displayName = useMemo(
    () => data?.name || channel,
    [data, channel],
  );

  if (!data) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-auto p-4">
      <div className="flex items-center mb-4">
        {data.image_url && (
          <img src={data.image_url} className="h-14 w-14 rounded-full mr-4" />
        )}
        <div className="flex flex-col">
          <span className="text-xl">{displayName}</span>
          <small className="text-slate-500">/{data.id}</small>
        </div>
        <Button
          className="ml-auto px-3 py-1 text-sm"
          variant={following ? "secondary" : "primary"}
          onClick={handleToggle}
        >
          {following ? "Unfollow" : "Follow"}
        </Button>
      </div>
      {data.description && (
        <p className="text-sm mb-3">{data.description}</p>
      )}
      <div className="flex gap-3 text-sm">
        {typeof data.member_count === "number" && (
          <p>
            <span className="font-bold">{data.member_count}</span> Members
          </p>
        )}
        {typeof data.follower_count === "number" && (
          <p>
            <span className="font-bold">{data.follower_count}</span> Followers
          </p>
        )}
        {data.external_url && (
          <p>
            <a
              href={data.external_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline"
            >
              {data.external_url}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default {
  fidget: Channel,
  properties: channelProperties,
} as FidgetModule<FidgetArgs<ChannelFidgetSettings>>;
