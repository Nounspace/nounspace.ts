import React, { useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import { useAppStore } from "@/common/data/stores/app";
import USER_NOT_LOGGED_IN_HOMEBASE_CONFIG from "@/constants/userNotLoggedInHomebase";
import SpacePage from "@/common/components/pages/SpacePage";
import { useRouter } from "next/router";
import { isNull, isString } from "lodash";
import { SpaceConfigSaveDetails } from "@/common/components/templates/Space";

const Homebase: NextPageWithLayout = () => {
  const {
    tabConfigs,
    loadTab,
    loadTabNames,
    saveTab,
    commitTab,
    resetTab,
    getIsLoggedIn,
    getIsInitializing,
    setCurrentSpaceId,
  } = useAppStore((state) => ({
    tabConfigs: state.homebase.tabs,
    loadTabNames: state.homebase.loadTabNames,
    loadTab: state.homebase.loadHomebaseTab,
    saveTab: state.homebase.saveHomebaseTabConfig,
    commitTab: state.homebase.commitHomebaseTabToDatabase,
    resetTab: state.homebase.resetHomebaseTabConfig,
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
  }));
  const router = useRouter();
  const queryTabName = router.query.tabname;
  const isLoggedIn = getIsLoggedIn();
  const isInitializing = getIsInitializing();

  const tabName = isString(queryTabName) ? queryTabName : "";

  useEffect(() => {
    loadTabNames();
  }, [router.pathname]);

  const loadConfig = () => loadTab(tabName);
  const homebaseConfig = tabConfigs[tabName]?.config;
  const saveConfig = (config: SpaceConfigSaveDetails) =>
    saveTab(tabName, config);
  const resetConfig = () => resetTab(tabName);
  const commitConfig = () => commitTab(tabName);

  useEffect(() => setCurrentSpaceId("homebase"), []);

  useEffect(() => {
    isLoggedIn && loadConfig();
  }, [isLoggedIn, tabName]);

  if (isNull(tabName)) {
    // Insert 404 page
    return;
  }

  const args = isInitializing
    ? {
        config: homebaseConfig ?? undefined,
        saveConfig: undefined,
        commitConfig: undefined,
        resetConfig: undefined,
      }
    : !isLoggedIn
      ? {
          config: USER_NOT_LOGGED_IN_HOMEBASE_CONFIG,
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
        }
      : {
          config: homebaseConfig,
          saveConfig,
          // To get types to match since store.commitConfig is debounced
          commitConfig: async () => await commitConfig(),
          resetConfig,
        };

  return <SpacePage {...args} />;
};

export default Homebase;
