import React, { useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import { useAppStore } from "@/common/data/stores/app";
import USER_NOT_LOGGED_IN_HOMEBASE_CONFIG from "@/constants/userNotLoggedInHomebase";
import SpacePage from "@/common/components/pages/SpacePage";
import { useRouter } from "next/router";
import { isNull, isString, noop } from "lodash";
import { SpaceConfigSaveDetails } from "@/common/components/templates/Space";
import TabBar from "@/common/components/organisms/TabBar";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";

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

    tabOrdering: state.homebase.tabOrdering,
    loadHomebaseTabOrder: state.homebase.loadTabOrdering,
    updateHomebaseTabOrder: state.homebase.updateTabOrdering,
    commitHomebaseTabOrder: state.homebase.commitTabOrderingToDatabase,
    createHomebaseTab: state.homebase.createTab,
    deleteHomebaseTab: state.homebase.deleteTab,
    renameHomebaseTab: state.homebase.renameTab,
  }));
  const router = useRouter();
  const queryTabName = router.query.tabname;
  const isLoggedIn = getIsLoggedIn();
  const isInitializing = getIsInitializing();

  const tabName = isString(queryTabName) ? queryTabName : "";

  useEffect(() => {
    loadHomebaseTabOrder();
  }, [router.pathname]);

  const loadConfig = () => {
    loadTab(tabName);
    loadHomebaseTabOrder();
  };
  const homebaseConfig = tabConfigs[tabName]?.config;
  const saveConfig = (config: SpaceConfigSaveDetails) =>
    saveTab(tabName, config);
  const resetConfig = () => resetTab(tabName);
  const commitConfig = () => {
    commitTab(tabName);
    commitHomebaseTabOrder();
  };

  useEffect(() => setCurrentSpaceId("homebase"), []);

  useEffect(() => {
    isLoggedIn && loadConfig();
  }, [isLoggedIn, tabName]);

  if (isNull(tabName)) {
    // TODO: Insert 404 page
    return;
  }

  function switchTabTo(tabName: string) {
    if (tabName === "Feed") {
      router.push(`/homebase`);
    } else {
      router.push(`/homebase/${tabName}`);
    }
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      inHomebase={true}
      currentTab={tabName}
      tabList={tabOrdering.local}
      switchTabTo={switchTabTo}
      updateTabOrder={updateHomebaseTabOrder}
      inEditMode={editMode}
      deleteTab={deleteHomebaseTab}
      createTab={createHomebaseTab}
      renameTab={renameHomebaseTab}
    />
  );

  const args = isInitializing
    ? {
        config: homebaseConfig ?? undefined,
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
          config: homebaseConfig,
          saveConfig,
          // To get types to match since store.commitConfig is debounced
          commitConfig: async () => await commitConfig(),
          resetConfig,
          tabBar: tabBar,
        };

  return <SpacePage {...args} />;
};

export default Homebase;
