import React from "react";
import SpaceLoading from "@/app/(spaces)/SpaceLoading";
import TabBar from "@/common/components/organisms/TabBar";

export default function HomebaseLoading() {
  // Simple tab bar with empty tabs for loading state
  const loadingTabBar = (
    <TabBar
      getSpacePageUrl={() => "#"}
      inHomebase={true}
      currentTab={"Feed"}
      tabList={["Feed"]}
      switchTabTo={() => {}}
      updateTabOrder={() => {}}
      inEditMode={false}
      deleteTab={() => {}}
      createTab={() => Promise.resolve()}
      renameTab={() => {}}
      commitTab={() => {}}
      commitTabOrder={() => {}}
    />
  );

  return <SpaceLoading tabBar={loadingTabBar} inEditMode={false} />;
} 