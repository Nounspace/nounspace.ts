"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import TabBar from "@/common/components/organisms/TabBar";
import {
  PRESS_TAB_CONFIG,
  NOUNS_TAB_CONFIG,
  NOUNSPACE_TAB_CONFIG,
} from "@/constants/homePageTabsConfig";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";

const getTabConfig = (tabName: string) => {
  switch (tabName) {
    case "Nounspace":
      return NOUNSPACE_TAB_CONFIG;
    case "Press":
      return PRESS_TAB_CONFIG;
    case "Nouns":
    default:
      return NOUNS_TAB_CONFIG;
  }
};

const Home = () => {
  const router = useRouter();
  const params = useParams();
  const { getIsAccountReady, getIsInitializing } = useAppStore((state) => ({
    getIsAccountReady: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
  }));
  const isLoggedIn = getIsAccountReady();
  const isInitializing = getIsInitializing();

  // Local state to manage current tab name and ordering
  const tabOrdering = ["Nouns", "Nounspace", "Press"];
  const [tabName, setTabName] = useState<string>("Nouns");

  useEffect(() => {
    const newTabName = params?.tabname
      ? decodeURIComponent(params.tabname as string)
      : "Nouns";

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
      createTab={async () => Promise.resolve({ tabName })}
      renameTab={async () => Promise.resolve({ tabName })}
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

  return <SpacePage key={tabName} {...args} />;
};

export default Home;
