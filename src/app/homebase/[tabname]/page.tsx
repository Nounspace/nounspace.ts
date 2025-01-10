"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/common/components/pages/SpacePage";
import { useRouter, useParams } from "next/navigation";
import { isNull, isString } from "lodash";
import { SpaceConfigSaveDetails } from "@/common/components/templates/Space";
import TabBar from "@/common/components/organisms/TabBar";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";

const Homebase = () => {
  const {
    tabConfigs,
    loadTab,
    saveTab,
    commitTab,
    resetTab,
    getIsLoggedIn,
    getIsInitializing,
    setCurrentSpaceId,
    setCurrentTabName,
    loadTabNames,
    tabOrdering,
    loadHomebaseTabOrder,
    updateHomebaseTabOrder,
    createHomebaseTab,
    deleteHomebaseTab,
    renameHomebaseTab,
    commitHomebaseTabOrder,
  } = useAppStore((state) => ({
    tabConfigs: state.homebase.tabs,
    loadTab: state.homebase.loadHomebaseTab,
    saveTab: state.homebase.saveHomebaseTabConfig,
    commitTab: state.homebase.commitHomebaseTabToDatabase,
    resetTab: state.homebase.resetHomebaseTabConfig,
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
    getCurrentTabName: state.currentSpace.getCurrentTabName,

    tabOrdering: state.homebase.tabOrdering,
    loadTabNames: state.homebase.loadTabNames,
    loadHomebaseTabOrder: state.homebase.loadTabOrdering,
    updateHomebaseTabOrder: state.homebase.updateTabOrdering,
    commitHomebaseTabOrder: state.homebase.commitTabOrderingToDatabase,
    createHomebaseTab: state.homebase.createTab,
    deleteHomebaseTab: state.homebase.deleteTab,
    renameHomebaseTab: state.homebase.renameTab,
  }));

  const router = useRouter();
  const params = useParams();
  const isLoggedIn = getIsLoggedIn();
  const isInitializing = getIsInitializing();
  const [tabName, setTabName] = useState<string>("");

  // First time load
  useEffect(() => {
    setCurrentSpaceId("homebase");
    if (params && isString(params.tabname)) {
      if (tabName !== params.tabname) {
        loadConfig();
      }
    }
  }, [params]);

  const homebaseTabConfig = tabConfigs[tabName]?.config;

  const loadConfig = async () => {
    const currentTabName =
      params && isString(params.tabname) ? params.tabname : "";

    setTabName(currentTabName);
    setCurrentTabName(currentTabName);

    if (tabOrdering.local.length === 0) {
      loadHomebaseTabOrder();
    }

    return loadTab(tabName);
  };

  const saveConfig = async (config: SpaceConfigSaveDetails) => {
    await saveTab(tabName, config);
    return commitTab(tabName);
  };

  const resetConfig = () => resetTab(tabName);

  const commitConfig = async () => {
    commitTab(tabName);
    commitHomebaseTabOrder();
    for (const tabName of tabOrdering.local) {
      await commitTab(tabName);
    }
  };

  async function switchTabTo(newTabName) {
    if (homebaseTabConfig) {
      await saveTab(tabName, homebaseTabConfig);
      await commitTab(tabName);
    }

    if (newTabName === "Feed") {
      router.push(`/homebase`);
    } else {
      router.push(`/homebase/${newTabName}`);
    }
  }

  function getSpacePageUrl(tabName: string) {
    if (tabName === "Feed") {
      return `/homebase`;
    }
    return `/homebase/${tabName}`;
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      getSpacePageUrl={getSpacePageUrl}
      inHomebase={true}
      currentTab={tabName}
      tabList={tabOrdering.local}
      switchTabTo={switchTabTo}
      updateTabOrder={updateHomebaseTabOrder}
      inEditMode={editMode}
      deleteTab={deleteHomebaseTab}
      createTab={createHomebaseTab}
      renameTab={renameHomebaseTab}
      commitTabOrder={commitHomebaseTabOrder}
      commitTab={commitTab}
    />
  );

  const args: SpacePageArgs = isInitializing
    ? {
        config: homebaseTabConfig ?? undefined,
        saveConfig: undefined,
        commitConfig: undefined,
        resetConfig: undefined,
        tabBar: tabBar,
      }
    : {
        config: homebaseTabConfig,
        saveConfig: async (config: SpaceConfigSaveDetails) =>
          await saveConfig(config),
        commitConfig: async () => await commitConfig(),
        resetConfig,
        tabBar: tabBar,
      };

  return <SpacePage {...args} />;
};

export default Homebase;
