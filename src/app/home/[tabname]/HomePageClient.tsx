"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import TabBar from "@/common/components/organisms/TabBar";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";
import SpaceLoading from "@/app/(spaces)/SpaceLoading";
import { SpaceConfig } from "@/app/(spaces)/Space";

interface HomePageClientProps {
  tabName: string;
  tabConfig: SpaceConfig;
}

const HomePageClient = ({ tabName, tabConfig }: HomePageClientProps) => {
  const router = useRouter();
  const { getIsInitializing } = useAppStore((state) => ({
    getIsInitializing: state.getIsInitializing,
  }));
  const isInitializing = getIsInitializing();

  // Local state to manage current tab name and ordering
  const tabOrdering = ["Nouns", "Nounspace", "Press"];

  function switchTabTo(newTabName: string) {
    router.push(`/home/${newTabName}`);
  }

  const tabBar = (
    <TabBar
      getSpacePageUrl={(tab) => `/home/${tab}`}
      inHomebase={false}
      currentTab={tabName}
      tabList={tabOrdering}
      switchTabTo={switchTabTo}
      inEditMode={false}
      updateTabOrder={async () => Promise.resolve()}
      deleteTab={async () => Promise.resolve()}
      createTab={async () => Promise.resolve({ tabName })}
      renameTab={async () => Promise.resolve({ tabName })}
      commitTab={async () => Promise.resolve()}
      commitTabOrder={async () => Promise.resolve()}
    />
  );

  if (isInitializing) {
    return (
      <div className="user-theme-background w-full h-full relative flex-col">
        <div className="w-full transition-all duration-100 ease-out">
          <div className="flex flex-col h-full">
            <TabBarSkeleton />
            <div className="flex h-full">
              <div className="grow">
                <SpaceLoading hasProfile={false} hasFeed={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const args: SpacePageArgs = {
    config: tabConfig,
    saveConfig: async () => {},
    commitConfig: async () => {},
    resetConfig: async () => {},
    tabBar: tabBar,
  };

  return <SpacePage key={tabName} {...args} />;
};

export default HomePageClient;
