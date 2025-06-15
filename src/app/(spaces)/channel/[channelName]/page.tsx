import React from "react";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import axiosBackend from "@/common/data/api/backend";
import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { type Channel } from "@/fidgets/farcaster/utils";
import { unstable_noStore as noStore } from "next/cache";
import ChannelSpace from "./ChannelSpace";

async function loadChannelInfo(channel: string): Promise<Channel | null> {
  try {
    const { data } = await axiosBackend.get<{ channel: Channel }>(
      "/api/farcaster/neynar/channel",
      { params: { id: channel } },
    );
    return data.channel;
  } catch {
    return null;
  }
}

async function getChannelSpace(channel: string) {
  noStore();
  const { data, error } = await createSupabaseServerClient()
    .from("spaceRegistrations")
    .select("spaceId")
    .eq("spaceName", channel)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0].spaceId as string;
}

export default async function ChannelSpacePage({ params }: any) {
  const { channelName, tabName } = params as {
    channelName?: string;
    tabName?: string;
  };
  if (!channelName) return <SpaceNotFound />;

  const info = await loadChannelInfo(channelName);
  if (!info) return <SpaceNotFound />;

  const spaceId = await getChannelSpace(channelName);

  return (
    <ChannelSpace
      channelName={channelName}
      spaceId={spaceId}
      tabName={tabName ?? "Feed"}
      spaceOwnerFid={info.host?.fid}
    />
  );
}
