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
    saveTab,
    commitTab,
    resetTab,
    getIsLoggedIn,
    getIsInitializing,
    setCurrentSpaceId,
  } = useAppStore((state) => ({
    tabConfigs: state.homebase.tabs,
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

  const tabname = isString(queryTabName) ? queryTabName : null;

  if (isNull(tabname)) {
    // Insert 404 page
    return;
  }

  const loadConfig = () => loadTab(tabname);
  const homebaseConfig = tabConfigs[tabname]?.config;
  const saveConfig = (config: SpaceConfigSaveDetails) =>
    saveTab(tabname, config);
  const resetConfig = () => resetTab(tabname);
  const commitConfig = () => commitTab(tabname);

  useEffect(() => setCurrentSpaceId("homebase"), []);

  useEffect(() => {
    isLoggedIn && loadConfig();
  }, [isLoggedIn]);

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
