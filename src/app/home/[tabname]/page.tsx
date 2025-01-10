"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/common/components/pages/SpacePage";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import TabBar from "@/common/components/organisms/TabBar";
import { isString } from "lodash";
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
    setCurrentSpaceId,
    setCurrentTabName,
  } = useAppStore((state) => ({
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
  }));
  const isLoggedIn = getIsLoggedIn();
  const isInitializing = getIsInitializing();

  // Local state to manage current tab name and ordering
  const tabOrdering = ["Welcome", "Fidgets", "Nouns", "Press"];
  const [tabName, setTabName] = useState<string>("Welcome");

  useEffect(() => {
    setCurrentSpaceId("home");

    if (params && isString(params.tabname)) {
      setTabName(params.tabname as string);
    } else {
      setTabName("Welcome");
    }

    setCurrentTabName(tabName);
  }, [params]);

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
      updateTabOrder={() => {}}
      deleteTab={() => {}}
      createTab={() => {}}
      renameTab={() => {}}
      commitTab={() => {}}
      commitTabOrder={() => {}}
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

  // Use the unique key directly in the JSX to trigger re-render
  return <SpacePage key={tabName ?? "welcome"} {...args} />;
};

export default Home;
