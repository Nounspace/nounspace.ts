"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/common/components/pages/SpacePage";
import { useRouter, useParams } from "next/navigation";
import { isNull, isString } from "lodash";
import { SpaceConfigSaveDetails } from "@/common/components/templates/Space";
import TabBar from "@/common/components/organisms/TabBar";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import { HOMEBASE_ID } from "@/common/data/stores/app/currentSpace";

import { isNil } from "lodash";
const HomebaseTab = () => {
  const {
    tabConfigs,
    loadTab,
    saveTab,
    commitTab,
    resetTab,
    setCurrentSpaceId,
    setCurrentTabName,
    loadTabNames,
    tabOrdering,
    getIsLoggedIn,
    getIsInitializing,
    loadTabOrder,
    updateTabOrder,
    createTab,
    deleteTab,
    renameTab,
    commitTabOrder,
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
    loadTabOrder: state.homebase.loadTabOrdering,
    updateTabOrder: state.homebase.updateTabOrdering,
    commitTabOrder: state.homebase.commitTabOrderingToDatabase,
    createTab: state.homebase.createTab,
    deleteTab: state.homebase.deleteTab,
    renameTab: state.homebase.renameTab,
  }));

  const router = useRouter();
  const params = useParams<{ tabname: string }>();
  const tabName = decodeURIComponent(params?.tabname ?? "");
  const [loading, setLoading] = useState(true);

  async function loadTabConfig() {
    setLoading(true);
    console.log("Loading tab config");
    await loadTabNames();
    console.log("Tab names loaded");
    if (tabOrdering.local.length === 0) {
      await loadTabOrder();
    }
    console.log("Tab order loaded");
    await loadTab(tabName);
    console.log("Specific tab loaded");
    setLoading(false);
    await loadRemainingTabs();
  }

  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
  useEffect(() => {
    setCurrentSpaceId(HOMEBASE_ID);
    setCurrentTabName(tabName);
    if (!isNil(tabName)) {
      loadTabConfig();
    }
  }, []);

  // Function to load remaining tabs
  const loadRemainingTabs = useCallback(async () => {
    const tabOrder = tabOrdering.local || [];
    for (const tab of tabOrder) {
      if (tabName !== tab) {
        await loadTab(tab);
      }
    }
  }, [tabOrdering, tabName, loadTab]);

  const config = {
    ...(tabConfigs[tabName]?.config
      ? tabConfigs[tabName]?.config
      : INITIAL_SPACE_CONFIG_EMPTY),
    isEditable: true,
  };

  const memoizedConfig = useMemo(() => {
    const { timestamp, ...restConfig } = config;
    return restConfig;
  }, [
    config.fidgetInstanceDatums,
    config.layoutID,
    config.layoutDetails,
    config.isEditable,
    config.fidgetTrayContents,
    config.theme,
  ]);

  const resetConfig = () => resetTab(tabName);

  const commitConfig = async () => {
    commitTab(tabName);
    commitTabOrder();
    for (const tabName of tabOrdering.local) {
      await commitTab(tabName);
    }
  };

  async function switchTabTo(newTabName) {
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
      updateTabOrder={updateTabOrder}
      inEditMode={editMode}
      deleteTab={deleteTab}
      createTab={createTab}
      renameTab={renameTab}
      commitTabOrder={commitTabOrder}
      commitTab={commitTab}
    />
  );

  const args: SpacePageArgs = loading
    ? {
        config: memoizedConfig ?? undefined,
        saveConfig: undefined,
        commitConfig: undefined,
        resetConfig: undefined,
        tabBar: tabBar,
      }
    : !getIsLoggedIn()
      ? {
          config: memoizedConfig ?? undefined,
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
          tabBar: tabBar,
        }
      : {
          config: memoizedConfig,
          saveConfig: async (config) => {
            console.log("Saving config", config);
            await saveTab(tabName, config);
            return commitConfig();
          },
          // To get types to match since store.commitConfig is debounced
          commitConfig: async () => {
            await commitConfig();
            for (const tabName of tabOrdering.local) {
              await commitTab(tabName);
            }
          },
          resetConfig,
          tabBar: tabBar,
        };

  console.log("args", args);

  return <SpacePage {...args} />;
};

export default HomebaseTab;
