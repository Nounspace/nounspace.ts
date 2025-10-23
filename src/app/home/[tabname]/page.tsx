"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import { SpaceConfig } from "@/app/(spaces)/Space";
import TabBar from "@/common/components/organisms/TabBar";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

import {
  RESOURCES_TAB_CONFIG,
  NOUNS_TAB_CONFIG,
  SOCIAL_TAB_CONFIG,
  GOVERNANCE_TAB_CONFIG,
  FUNDED_WORKS_TAB_CONFIG,
  PLACES_TAB_CONFIG,
} from "./homePageTabsConfig";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/config";
import { useSystemConfig } from "@/hooks/useSystemConfig";

const getTabConfig = (tabName: string, config: any): SpaceConfig => {
  return config.homePage.tabs[tabName] || config.homePage.tabs[config.homePage.defaultTab];
};

const Home = () => {
  const router = useRouter();
  const params = useParams();
  const config = useSystemConfig();
  const { getIsAccountReady, getIsInitializing, setCurrentTabName, currentTabName } = useAppStore((state) => ({
    getIsAccountReady: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
    currentTabName: state.currentSpace.currentTabName,
  }));
  const isLoggedIn = getIsAccountReady();
  const isInitializing = getIsInitializing();

  // Tab ordering for homepage from configuration
  const tabOrdering = config.homePage.tabOrder;

  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  useEffect(() => {
    const newTabName = params?.tabname
      ? decodeURIComponent(params.tabname as string)
      : config.homePage.defaultTab;

    setCurrentTabName(newTabName);
  }, [params?.tabname, setCurrentTabName, config.homePage.defaultTab]);

  function switchTabTo(newTabName: string) {
    // Update the store immediately for better responsiveness
    setCurrentTabName(newTabName);
    router.push(`/home/${newTabName}`);
  }

  const tabBar = (
    <TabBar
      getSpacePageUrl={(tab) => `/home/${tab}`}
      inHomebase={false}
      currentTab={currentTabName ?? config.homePage.defaultTab}
      tabList={tabOrdering}
      defaultTab={config.homePage.defaultTab}
      inEditMode={false}
      updateTabOrder={async () => Promise.resolve()}
      deleteTab={async () => Promise.resolve()}
      createTab={async () => Promise.resolve({ tabName: currentTabName ?? config.homePage.defaultTab })}
      renameTab={async () => Promise.resolve(void 0)}
      commitTab={async () => Promise.resolve()}
      commitTabOrder={async () => Promise.resolve()}
      isEditable={false}
    />
  );

  const args: SpacePageArgs = {
    config: getTabConfig(currentTabName ?? config.homePage.defaultTab, config) as SpaceConfig,
    saveConfig: async () => {},
    commitConfig: async () => {},
    resetConfig: async () => {},
    tabBar: tabBar,
    showFeedOnMobile: false,
  };

  return <SpacePage key={currentTabName} {...args} />;
};

export default Home;
