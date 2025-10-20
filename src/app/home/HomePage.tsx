"use client";

import React, { useEffect, useMemo } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

import TabBar from "@/common/components/organisms/TabBar";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import { SpaceConfig } from "@/app/(spaces)/Space";

import {
  RESOURCES_TAB_CONFIG,
  NOUNS_TAB_CONFIG,
  SOCIAL_TAB_CONFIG,
  GOVERNANCE_TAB_CONFIG,
  FUNDED_WORKS_TAB_CONFIG,
  PLACES_TAB_CONFIG,
} from "./[tabname]/homePageTabsConfig";

const DEFAULT_TAB_NAME = "Nouns";
const HOME_TAB_ORDER = [
  "Nouns",
  "Social",
  "Governance",
  "Resources",
  "Funded Works",
  "Places",
];

const TAB_CONFIG_BY_NAME: Record<string, SpaceConfig> = {
  Governance: GOVERNANCE_TAB_CONFIG as SpaceConfig,
  Resources: RESOURCES_TAB_CONFIG as SpaceConfig,
  "Funded Works": FUNDED_WORKS_TAB_CONFIG as SpaceConfig,
  Social: SOCIAL_TAB_CONFIG as SpaceConfig,
  Places: PLACES_TAB_CONFIG as SpaceConfig,
  Nouns: NOUNS_TAB_CONFIG as SpaceConfig,
};

const resolveTabConfig = (tabName: string): SpaceConfig => {
  return TAB_CONFIG_BY_NAME[tabName] ?? TAB_CONFIG_BY_NAME[DEFAULT_TAB_NAME];
};

export type HomePageProps = {
  tabNameFromPath?: string;
  defaultTabName?: string;
  buildTabPath?: (tabName: string) => string;
};

const HomePage = ({
  tabNameFromPath,
  defaultTabName = DEFAULT_TAB_NAME,
  buildTabPath,
}: HomePageProps) => {
  const { setFrameReady, isFrameReady } = useMiniKit();

  const { setCurrentTabName, currentTabName } = useAppStore((state) => ({
    setCurrentTabName: state.currentSpace.setCurrentTabName,
    currentTabName: state.currentSpace.currentTabName,
  }));

  const resolvedDefaultTab = tabNameFromPath ?? defaultTabName;

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  useEffect(() => {
    setCurrentTabName(resolvedDefaultTab);
  }, [resolvedDefaultTab, setCurrentTabName]);

  const activeTabName = currentTabName ?? resolvedDefaultTab;

  const getSpacePageUrl = useMemo(() => {
    if (buildTabPath) {
      return buildTabPath;
    }

    return (tab: string) => `/home/${tab}`;
  }, [buildTabPath]);

  const tabBar = (
    <TabBar
      getSpacePageUrl={getSpacePageUrl}
      inHomebase={false}
      currentTab={activeTabName}
      tabList={HOME_TAB_ORDER}
      defaultTab={DEFAULT_TAB_NAME}
      inEditMode={false}
      updateTabOrder={async () => Promise.resolve()}
      deleteTab={async () => Promise.resolve()}
      createTab={async () => Promise.resolve({ tabName: activeTabName })}
      renameTab={async () => Promise.resolve(void 0)}
      commitTab={async () => Promise.resolve()}
      commitTabOrder={async () => Promise.resolve()}
      isEditable={false}
    />
  );

  const args: SpacePageArgs = {
    config: resolveTabConfig(activeTabName),
    saveConfig: async () => {},
    commitConfig: async () => {},
    resetConfig: async () => {},
    tabBar,
    showFeedOnMobile: false,
  };

  return <SpacePage key={activeTabName} {...args} />;
};

export default HomePage;
