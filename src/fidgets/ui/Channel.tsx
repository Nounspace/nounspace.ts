import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/common/components/atoms/button";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetModule, FidgetProperties } from "@/common/fidgets";
import axiosBackend from "@/common/data/api/backend";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { followChannel, unfollowChannel } from "@/fidgets/farcaster/utils";
import { usePrivy } from "@privy-io/react-auth";
import { useAppStore } from "@/common/data/stores/app";

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

const useChannelInfo = (channel: string) => {
  return useQuery({
    queryKey: ["channel-info", channel],
    queryFn: async () => {
      const { data } = await axiosBackend.get(
        "/api/farcaster/neynar/channel",
        { params: { id: channel } },
      );
      return data.channel as any;
    },
  });
};

const useFollowStatus = (channel: string, viewerFid?: number) => {
  return useQuery({
    queryKey: ["channel-follow-status", channel, viewerFid],
    enabled: Boolean(channel && viewerFid),
    queryFn: async () => {
      const { data } = await axiosBackend.get("/api/farcaster/user-channel", {
        params: { channelId: channel, fid: viewerFid },
      });
      return data.result?.following === true;
    },
  });
};

interface FarcasterProfile { fid: number; token?: string; }

const Channel: React.FC<FidgetArgs<ChannelFidgetSettings>> = ({
  settings: { channel },
}) => {
  const { user } = usePrivy();
  const farcaster = user?.farcaster as unknown as FarcasterProfile | undefined;
  const viewerFid = farcaster?.fid;
  const authToken = farcaster?.token;

  const queryClient = useQueryClient();
  const { setModalOpen, getIsAccountReady } = useAppStore((s) => ({
    setModalOpen: s.setup.setModalOpen,
    getIsAccountReady: s.getIsAccountReady,
  }));

  const { data } = useChannelInfo(channel);
  const { data: isFollowing } = useFollowStatus(channel, viewerFid);
  const [following, setFollowing] = useState<boolean>(false);

  useEffect(() => {
    if (typeof isFollowing === "boolean") setFollowing(isFollowing);
  }, [isFollowing]);

  const handleToggle = async () => {
    if (!getIsAccountReady()) { setModalOpen(true); return; }
    if (!viewerFid) { console.error("Missing viewerFid"); return; }

    setFollowing((p) => !p); // optimistic
    const auth = authToken
      ? ({ authToken } as const)
      : ({ fid: viewerFid, useServerAuth: true } as const);

    const ok = following
      ? await unfollowChannel(channel, auth)
      : await followChannel(channel, auth);

    if (!ok) {
      setFollowing((p) => !p); // revert on failure
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["channel-follow-status", channel, viewerFid] });
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
          {following ? "Following" : "Follow"}
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
