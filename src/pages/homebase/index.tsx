import React, { useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import { useAppStore } from "@/common/data/stores/app";
import USER_NOT_LOGGED_IN_HOMEBASE_CONFIG from "@/constants/userNotLoggedInHomebase";
import SpacePage from "@/common/components/pages/SpacePage";

const Homebase: NextPageWithLayout = () => {
  const {
    homebaseConfig,
    saveConfig,
    loadConfig,
    commitConfig,
    resetConfig,
    getIsLoggedIn,
    getIsInitializing,
    setCurrentSpaceId,
  } = useAppStore((state) => ({
    homebaseConfig: state.homebase.homebaseConfig,
    saveConfig: state.homebase.saveHomebaseConfig,
    loadConfig: state.homebase.loadHomebase,
    commitConfig: state.homebase.commitHomebaseToDatabase,
    resetConfig: state.homebase.resetHomebaseConfig,
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
  }));
  const isLoggedIn = getIsLoggedIn();
  const isInitializing = getIsInitializing();

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

  // Add feed to the args

  return <SpacePage {...args} />;
};

export default Homebase;
