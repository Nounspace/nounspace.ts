"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import { SpaceConfig } from "@/app/(spaces)/Space";
import TabBar from "@/common/components/organisms/TabBar";
import {
  RESOURCES_TAB_CONFIG,
  NOUNS_TAB_CONFIG,
  SOCIAL_TAB_CONFIG,
  GOVERNANCE_TAB_CONFIG,
  FUNDED_WORKS_TAB_CONFIG,
  PLACES_TAB_CONFIG,
} from "./homePageTabsConfig";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";

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
  const { getIsAccountReady, getIsInitializing, setCurrentTabName } = useAppStore((state) => ({
    getIsAccountReady: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
  }));
  const isLoggedIn = getIsAccountReady();
  const isInitializing = getIsInitializing();

  // Local state to manage current tab name and ordering
  const tabOrdering = ["Nouns", "Social", "Governance", "Resources", "Funded Works", "Places"];
  const [tabName, setTabName] = useState<string>("Nouns");

  useEffect(() => {
    const newTabName = params?.tabname
      ? decodeURIComponent(params.tabname as string)
      : "Nouns";

    setTabName(newTabName);
    // Also update the global store to keep it in sync
    setCurrentTabName(newTabName);
  }, [params?.tabname, setCurrentTabName]); // Added params.tabname to dependencies

  function switchTabTo(newTabName: string) {
    // Update the store immediately for better responsiveness
    setCurrentTabName(newTabName);
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
      isEditable={false}
    />
  );

  const args: SpacePageArgs = isInitializing
    ? {
        config: { ...INITIAL_SPACE_CONFIG_EMPTY, isEditable: false } as SpaceConfig,
        saveConfig: async () => {},
        commitConfig: async () => {},
        resetConfig: async () => {},
        tabBar: tabBar,
        showFeedOnMobile: false,
      }
    : !isLoggedIn
      ? {
          config: getTabConfig(tabName) as SpaceConfig,
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
          tabBar: tabBar,
          showFeedOnMobile: false,
        }
      : {
          config: getTabConfig(tabName) as SpaceConfig,
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
          tabBar: tabBar,
          showFeedOnMobile: false,
        };

  return <SpacePage key={tabName} {...args} />;
};

export default Home;
