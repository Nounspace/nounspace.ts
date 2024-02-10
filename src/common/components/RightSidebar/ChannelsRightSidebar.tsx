import React from 'react';
import ChannelsOverview from "./ChannelsOverview";

const ChannelsRightSidebar = () => {
  return <aside className="bg-background lg:fixed lg:bottom-0 lg:right-0 lg:top-16 lg:w-64 lg:border-l lg:border-white/5">
    <ChannelsOverview />
  </aside>
}

export default ChannelsRightSidebar;
