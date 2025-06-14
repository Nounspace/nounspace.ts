import React from "react";
import ChannelSpace from "./ChannelSpace";
import { getChannelInfo } from "./utils";

export default async function ChannelSpacePage({ params }) {
  const channelName = params?.channelName as string;
  const channel = await getChannelInfo(channelName);
  if (!channel) {
    return <div>Channel not found</div>;
  }
  return (
    <ChannelSpace channel={channel} />
  );
}
