import React, { useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import { useAppStore } from "@/common/data/stores/app";
import USER_NOT_LOGGED_IN_HOMEBASE_CONFIG from "@/constants/userNotLoggedInHomebase";
import SpacePage, { SpacePageArgs } from "@/common/components/pages/SpacePage";
import FeedModule, { FilterType } from "@/fidgets/farcaster/Feed";
import { FeedType } from "@neynar/nodejs-sdk";
import { Platform } from "@/common/components/molecules/PlatformSelector";
import { noop } from "lodash";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";

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
  const currentFid = useCurrentFid();

  useEffect(() => setCurrentSpaceId("homebase"), []);

  useEffect(() => {
    isLoggedIn && loadConfig();
  }, [isLoggedIn]);

  const args: SpacePageArgs = isInitializing
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

  if (currentFid) {
    args.feed = (
      <FeedModule.fidget
        settings={{
          feedType: FeedType.Following,
          users: "",
          filterType: FilterType.Users,
          selectPlatform: { name: "Farcaster", icon: "/images/farcaster.jpeg" },
          Xhandle: "",
          style: "",
        }}
        saveData={async () => noop()}
        data={{}}
      />
    );
  }

  return <SpacePage {...args} />;
};

export default Homebase;
