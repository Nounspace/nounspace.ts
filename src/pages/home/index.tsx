import React, { useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import { useAppStore } from "@/common/data/stores/app";
import USER_NOT_LOGGED_IN_HOMEBASE_CONFIG from "@/constants/userNotLoggedInHomebase";
import SpacePage, { SpacePageArgs } from "@/common/components/pages/SpacePage";
import FeedModule, { FilterType } from "@/fidgets/farcaster/Feed";
import { FeedType } from "@neynar/nodejs-sdk";
import { noop } from "lodash";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import TabBar from "@/common/components/organisms/TabBar";
import { useRouter } from "next/router";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import {
  TAB1_HOMEBASE_CONFIG,
  TAB2_HOMEBASE_CONFIG,
} from "@/constants/tab1Homebaseconfig";

const getTabConfig = (tabName: string) => {
  switch (tabName) {
    case "Step1":
      console.log("TAB1_HOMEBASE_CONFIG", TAB1_HOMEBASE_CONFIG);
      return TAB1_HOMEBASE_CONFIG;
    case "Step2":
      console.log("TAB2_HOMEBASE_CONFIG", TAB2_HOMEBASE_CONFIG);
      return TAB2_HOMEBASE_CONFIG;
    default:
      console.log(
        "USER_NOT_LOGGED_IN_HOMEBASE_CONFIG",
        USER_NOT_LOGGED_IN_HOMEBASE_CONFIG,
      );
      return USER_NOT_LOGGED_IN_HOMEBASE_CONFIG;
  }
};

const Home: NextPageWithLayout = () => {
  const router = useRouter();
  const {
    saveConfig,
    loadConfig,
    commitConfig,
    resetConfig,
    getIsLoggedIn,
    getIsInitializing,
    setCurrentSpaceId,
    setCurrentTabName,
    loadHomebaseTabOrder,
    updateHomebaseTabOrder,
    createHomebaseTab,
    deleteHomebaseTab,
    renameHomebaseTab,
    commitHomebaseTab,
    commitHomebaseTabOrder,
  } = useAppStore((state) => ({
    saveConfig: state.homebase.saveHomebaseConfig,
    loadConfig: state.homebase.loadHomebase,
    commitConfig: state.homebase.commitHomebaseToDatabase,
    commitHomebaseTab: state.homebase.commitHomebaseTabToDatabase,
    resetConfig: state.homebase.resetHomebaseConfig,
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
    loadHomebaseTabOrder: state.homebase.loadTabOrdering,
    updateHomebaseTabOrder: state.homebase.updateTabOrdering,
    commitHomebaseTabOrder: state.homebase.commitTabOrderingToDatabase,
    createHomebaseTab: state.homebase.createTab,
    deleteHomebaseTab: state.homebase.deleteTab,
    renameHomebaseTab: state.homebase.renameTab,
  }));
  const isLoggedIn = getIsLoggedIn();
  const isInitializing = getIsInitializing();
  const currentFid = useCurrentFid();
  const [tabOrdering, setTabOrdering] = React.useState({
    local: ["Step1", "Step2", "Step3"],
  });
  const tabName = router.query.tabname as string; // Correctly extract `tabName` from the router

  useEffect(() => {
    if (isLoggedIn) {
      loadConfig();
      if (tabOrdering.local.length === 0) {
        loadHomebaseTabOrder();
      }
    }
  }, [isLoggedIn]);
  const homebaseConfig = getTabConfig(tabName);

  function switchTabTo(newTabName: string) {
    if (homebaseConfig) {
      saveConfig(homebaseConfig); // Only pass `homebaseConfig` as a single argument
      commitHomebaseTab(newTabName);
      console.log("Switched to tab", newTabName);
      console.log("config", homebaseConfig);
    }
    router.push(`/home/${newTabName}`);
  }

  function getSpacePageUrl(tabName: string) {
    switch (tabName) {
      case "Step1":
        return `/home/step1`;
      case "Step2":
        return `/home/step2`;
      default:
        return `/home`;
    }
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      getSpacePageUrl={getSpacePageUrl}
      inHomebase={true}
      currentTab={tabName ?? "Feed"}
      tabList={tabOrdering.local}
      switchTabTo={switchTabTo}
      updateTabOrder={updateHomebaseTabOrder}
      inEditMode={editMode}
      deleteTab={deleteHomebaseTab}
      createTab={createHomebaseTab}
      renameTab={renameHomebaseTab}
      commitTab={commitHomebaseTab}
      commitTabOrder={commitHomebaseTabOrder}
    />
  );
  useEffect(() => setCurrentSpaceId("homebase"), []);
  useEffect(() => setCurrentTabName(tabName), []);

  const args: SpacePageArgs = isInitializing
    ? {
        config: getTabConfig(tabName) ?? undefined,
        saveConfig: undefined,
        commitConfig: undefined,
        resetConfig: undefined,
        tabBar: tabBar,
      }
    : !isLoggedIn
      ? {
          config: USER_NOT_LOGGED_IN_HOMEBASE_CONFIG,
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
          tabBar: tabBar,
        }
      : {
          config: getTabConfig(tabName),
          saveConfig,
          commitConfig: async () => await commitConfig(),
          resetConfig,
          tabBar: tabBar,
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
          fontFamily: "var(--user-theme-font)",
          fontColor: "var(--user-theme-font-color)" as any, // Type assertion
        }}
        saveData={async () => noop()}
        data={{}}
      />
    );
  }

  return <SpacePage {...args} />;
};

export default Home;
