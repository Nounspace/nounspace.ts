import React, { useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import { useAppStore } from "@/common/data/stores/app";
import SpaceWithLoader from "@/common/components/templates/SpaceWithLoader";
import USER_NOT_LOGGED_IN_HOMEBASE_CONFIG from "@/constants/userNotLoggedInHomebase";

const Homebase: NextPageWithLayout = () => {
  const {
    homebaseConfig,
    saveConfig,
    loadConfig,
    commitConfig,
    resetConfig,
    getIsLoggedIn,
    getIsInitializing,
  } = useAppStore((state) => ({
    homebaseConfig: state.homebase.homebaseConfig,
    saveConfig: state.homebase.saveHomebaseConfig,
    loadConfig: state.homebase.loadHomebase,
    commitConfig: state.homebase.commitHomebaseToDatabase,
    resetConfig: state.homebase.resetHomebaseConfig,
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
  }));
  const isLoggedIn = getIsLoggedIn();
  const isInitializing = getIsInitializing();

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
          commitConfig,
          resetConfig,
        };

  return <SpaceWithLoader {...args} />;
};

Homebase.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <div
      className="min-h-screen max-w-screen h-screen w-screen"
      style={{ background: "var(--user-theme-background)" }}
    >
      {page}
    </div>
  );
};

export default Homebase;
