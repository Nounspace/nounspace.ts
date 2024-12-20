import React, { useEffect, useState } from "react";
import { NextPageWithLayout } from "../_app";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/common/data/stores/app";
import USER_NOT_LOGGED_IN_HOMEBASE_CONFIG from "@/constants/userNotLoggedInHomebase";
import SpacePage, { SpacePageArgs } from "@/common/components/pages/SpacePage";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import TabBar from "@/common/components/organisms/TabBar";
import { isString } from "lodash";
import {
  FIDGETS_TAB_HOMEBASE_CONFIG,
  PRESS_TAB_HOME_CONFIG,
  NOUNS_TAB_HOMEBASE_CONFIG,
} from "@/constants/initialHomebaseTabsConfig";

// Enhanced logging to trace configuration logic
const getTabConfig = (tabName: string) => {
  // console.log(`getTabConfig called with tabName: ${tabName}`);
  switch (tabName) {
    case "Fidgets":
      return FIDGETS_TAB_HOMEBASE_CONFIG;
    case "Nouns":
      return NOUNS_TAB_HOMEBASE_CONFIG;
    case "Press":
      return PRESS_TAB_HOME_CONFIG;
    default:
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
  const { editMode } = useSidebarContext();

  // Local state to manage current tab name and ordering
  const [tabOrdering, setTabOrdering] = useState({
    local: ["Fidgets", "Nouns", "Press"],
  });
  const [tabName, setTabName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isLoggedIn && tabName === undefined) {
      router.push("/");
    }
  }, [isLoggedIn, tabName]);
  // Monitor router changes and update tab name accordingly
  useEffect(() => {
    if (router.isReady && isString(router.query.tabname)) {
      const queryTabName = router.query.tabname as string;
      setTabName(queryTabName);
      setCurrentTabName(queryTabName);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (isLoggedIn && tabName) {
      loadConfig();
      if (tabOrdering.local.length === 0) {
        loadHomebaseTabOrder();
      }
    }
  }, [isLoggedIn, tabName]);

  function switchTabTo(newTabName: string) {
    if (tabName) {
      const configToSave = getTabConfig(tabName);
      saveConfig(configToSave);
      commitHomebaseTab(newTabName);
    }
    router.push(`/home/${newTabName}`);
  }

  const tabBar = (
    <TabBar
      getSpacePageUrl={(tab) => `/home/${tab}`}
      inHome={true}
      inHomebase={false}
      currentTab={tabName ?? "Welcome"}
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
          config:
            // test whic tab the user is in
            getTabConfig(tabName || "welcome"),
          saveConfig: async () => {},
          commitConfig: async () => {},
          resetConfig: async () => {},
          tabBar: tabBar,
        }
      : {
          config: getTabConfig(tabName || "welcome"),
          saveConfig,
          commitConfig: async () => await commitConfig(),
          resetConfig,
          tabBar: tabBar,
        };

  // Use the unique key directly in the JSX to trigger re-render
  return <SpacePage key={tabName ?? "welcome"} {...args} />;
};

export default Home;
