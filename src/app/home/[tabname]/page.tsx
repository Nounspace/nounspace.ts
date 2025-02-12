"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/common/components/pages/SpacePage";
import TabBar from "@/common/components/organisms/TabBar";  
import {
  WELCOME_TAB_HOMEBASE_CONFIG,
  FIDGETS_TAB_HOMEBASE_CONFIG,
  PRESS_TAB_HOME_CONFIG,
  NOUNS_TAB_HOMEBASE_CONFIG,
} from "@/constants/homePageTabConfigs";

const getTabConfig = (tabName: string) => {
  switch (tabName) {
    case "Fidgets":
      return FIDGETS_TAB_HOMEBASE_CONFIG;
    case "Nouns":
      return NOUNS_TAB_HOMEBASE_CONFIG;
    case "Press":
      return PRESS_TAB_HOME_CONFIG;
    default:
      return WELCOME_TAB_HOMEBASE_CONFIG;
  }
};

const Home = () => {
  const router = useRouter();
  const params = useParams();
  const {
    getIsLoggedIn,
    getIsInitializing,
  } = useAppStore((state) => ({
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
  }));
  const isLoggedIn = getIsLoggedIn();
  const isInitializing = getIsInitializing();

  // Local state to manage current tab name and ordering
  const tabOrdering = ["Welcome", "Fidgets", "Nouns", "Press"];
  const [tabName, setTabName] = useState<string>("Welcome");

  useEffect(() => {
    const newTabName = params?.tabname ? 
      decodeURIComponent(params.tabname as string) : 
      "Welcome";
    
    setTabName(newTabName);
  }, []);

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
      createTab={async () => Promise.resolve()}
      renameTab={async () => Promise.resolve()}
      commitTab={async () => Promise.resolve()}
      commitTabOrder={async () => Promise.resolve()}
    />
  );

  const args: SpacePageArgs = isInitializing
    ? {
        config: undefined,
        saveConfig: undefined,
        commitConfig: undefined,
        resetConfig: undefined,
        tabBar: tabBar,
      }
    : !isLoggedIn
      ? {
          config: getTabConfig(tabName),
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
          tabBar: tabBar,
        }
      : {
          config: getTabConfig(tabName),
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
          tabBar: tabBar,
        };

  // Remove the key prop since we don't need to force re-render
  return <SpacePage {...args} />;
};

export default Home;
