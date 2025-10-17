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
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialSpaceConfig";

const getTabConfig = (tabName: string) => {
  switch (tabName) {
    case "Governance":
      return GOVERNANCE_TAB_CONFIG;
    case "Resources":
      return RESOURCES_TAB_CONFIG;
    case "Funded Works":
      return FUNDED_WORKS_TAB_CONFIG;
    case "Social":
      return SOCIAL_TAB_CONFIG;
    case "Places":
      return PLACES_TAB_CONFIG;
    case "Nouns":
      return NOUNS_TAB_CONFIG;
    default:
      return NOUNS_TAB_CONFIG;
  }
};

const Home = () => {
  const router = useRouter();
  const params = useParams();
  const { getIsAccountReady, getIsInitializing, setCurrentTabName, currentTabName } = useAppStore((state) => ({
    getIsAccountReady: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
    currentTabName: state.currentSpace.currentTabName,
  }));
  const isLoggedIn = getIsAccountReady();
  const isInitializing = getIsInitializing();

  // Tab ordering for homepage
  const tabOrdering = ["Nouns", "Social", "Governance", "Resources", "Funded Works", "Places"];

  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  useEffect(() => {
    const newTabName = params?.tabname
      ? decodeURIComponent(params.tabname as string)
      : "Nouns";

    setCurrentTabName(newTabName);
  }, [params?.tabname, setCurrentTabName]);

  function switchTabTo(newTabName: string) {
    // Update the store immediately for better responsiveness
    setCurrentTabName(newTabName);
    router.push(`/home/${newTabName}`);
  }

  const tabBar = (
    <TabBar
      getSpacePageUrl={(tab) => `/home/${tab}`}
      inHomebase={false}
      currentTab={currentTabName ?? "Nouns"}
      tabList={tabOrdering}
      defaultTab={"Nouns"}
      inEditMode={false}
      updateTabOrder={async () => Promise.resolve()}
      deleteTab={async () => Promise.resolve()}
      createTab={async () => Promise.resolve({ tabName: currentTabName ?? "Nouns" })}
      renameTab={async () => Promise.resolve(void 0)}
      commitTab={async () => Promise.resolve()}
      commitTabOrder={async () => Promise.resolve()}
      isEditable={false}
    />
  );

  const args: SpacePageArgs = {
    config: getTabConfig(currentTabName ?? "Nouns") as SpaceConfig,
    saveConfig: async () => {},
    commitConfig: async () => {},
    resetConfig: async () => {},
    tabBar: tabBar,
    showFeedOnMobile: false,
  };

  return <SpacePage key={currentTabName} {...args} />;
};

export default Home;
