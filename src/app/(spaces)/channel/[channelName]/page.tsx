import React from "react";
import { unstable_noStore as noStore } from "next/cache";
import ChannelSpace from "./ChannelSpace";
import createSupabaseServerClient from "@/common/data/database/supabase/clients/server";
import axiosBackend from "@/common/data/api/backend";

interface ChannelPageProps {
  params: { channelName?: string; tabName?: string };
}

const loadChannelSpaceData = async (channelName: string, tabNameParam?: string) => {
  noStore();
  const { data } = await axiosBackend.get<{ channel: any }>(
    "/api/farcaster/neynar/channel",
    { params: { id: channelName } },
  );
  const ownerFid = data.channel?.host || null;

  const { data: registrations } = await createSupabaseServerClient()
    .from("spaceRegistrations")
    .select("spaceId, spaceName, channelName")
    .eq("channelName", channelName)
    .limit(1);

  const spaceId = registrations?.[0]?.spaceId || null;
  const tabName = tabNameParam || "Profile";

  return { ownerFid, spaceId, tabName };
};

const ChannelPage = async ({ params }: ChannelPageProps) => {
  const { channelName, tabName } = params;
  if (!channelName) return null;
  const { ownerFid, spaceId, tabName: defaultTab } = await loadChannelSpaceData(
    channelName,
    tabName,
  );

  return (
    <ChannelSpace
      channelName={channelName}
      ownerFid={ownerFid}
      spaceId={spaceId}
      tabName={defaultTab}
    />
  );
};

export default ChannelPage;
