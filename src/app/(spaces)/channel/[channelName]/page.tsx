import React from "react";
import createInitialChannelSpaceConfig from "@/constants/initialChannelSpace";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import axiosBackend from "@/common/data/api/backend";
import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import { type Channel } from "@/fidgets/farcaster/utils";
import { unstable_noStore as noStore } from 'next/cache';

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

// Define the expected params for this page
export interface ChannelPageProps {
  params: ChannelPageParams;
}

interface ChannelPageParams {
  channelName?: string;
  tabName?: string;
}

export default async function ChannelSpace({
  params,
}: ChannelPageProps) {
  const channelName = params?.channelName as string;
  if (!channelName) return <SpaceNotFound />;

  const info = await loadChannelInfo(channelName);
  if (!info) return <SpaceNotFound />;

  const spaceId = await getChannelSpace(channelName);
  const INITIAL_CONFIG = createInitialChannelSpaceConfig(channelName);

  const getSpacePageUrl = (_: string) => `/channel/${channelName}`;

  return (
    <PublicSpace
      spaceId={spaceId}
      tabName="Feed"
      initialConfig={INITIAL_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      spaceOwnerFid={info.host?.fid}
      pageType="channel"
      channelName={channelName}
    />
  );
}
