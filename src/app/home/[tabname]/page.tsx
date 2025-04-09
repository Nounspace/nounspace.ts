"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import TabBar from "@/common/components/organisms/TabBar";  
import {
  FIDGETS_TAB_CONFIG,
  PRESS_TAB_CONFIG,
  NOUNS_TAB_CONFIG,
  WELCOME_TAB_CONFIG,
} from "@/constants/homePageTabsConfig";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";

const getTabConfig = (tabName: string) => {
  switch (tabName) {
    case "Fidgets":
      return FIDGETS_TAB_CONFIG;
    case "Nouns":
      return NOUNS_TAB_CONFIG;
    case "Press":
      return PRESS_TAB_CONFIG;
    default:
      return WELCOME_TAB_CONFIG;
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
        config: { ...INITIAL_SPACE_CONFIG_EMPTY, isEditable: false },
        saveConfig: async () => {},
        commitConfig: async () => {},
        resetConfig: async () => {},
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

  return <SpacePage {...args} />;
};

export default Home;
