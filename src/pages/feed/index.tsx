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

const Homebase: NextPageWithLayout = () => {
  const router = useRouter();
  const {
    homebaseConfig,
    saveConfig,
    loadConfig,
    commitConfig,
    resetConfig,
    getIsLoggedIn,
    getIsInitializing,
    setCurrentSpaceId,
    setCurrentTabName,
    tabOrdering,
    loadHomebaseTabOrder,
    updateHomebaseTabOrder,
    createHomebaseTab,
    deleteHomebaseTab,
    renameHomebaseTab,
    commitHomebaseTab,
    commitHomebaseTabOrder,
  } = useAppStore((state) => ({
    homebaseConfig: state.homebase.homebaseConfig,
    saveConfig: state.homebase.saveHomebaseConfig,
    loadConfig: state.homebase.loadHomebase,
    commitConfig: state.homebase.commitHomebaseToDatabase,
    commitHomebaseTab: state.homebase.commitHomebaseTabToDatabase,
    resetConfig: state.homebase.resetHomebaseConfig,
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    setCurrentTabName: state.currentSpace.setCurrentTabName,

    tabOrdering: state.homebase.tabOrdering,
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

  useEffect(() => setCurrentSpaceId("homebase"), []);
  useEffect(() => setCurrentTabName("Feed"), []);
  useEffect(() => {
    if (isLoggedIn) {
      loadConfig();
      if (tabOrdering.local.length === 0) {
        loadHomebaseTabOrder();
      }
    }
  }, [isLoggedIn]);

  function switchTabTo(tabName: string) {
    if (tabName !== "Feed") {
      router.push(`/feed/${tabName}`);
    }
  }

  function getSpacePageUrl(tabName: string) {
    if (tabName === "Feed") {
      return `/feed`;
    } else {
      return `/feed/${tabName}`;
    }
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      getSpacePageUrl={getSpacePageUrl}
      inHomebase={true}
      currentTab={"Feed"}
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
          saveConfig: async (config) => {
            await saveConfig(config);
            return commitConfig();
          },
          // To get types to match since store.commitConfig is debounced
          commitConfig: async () => {
            await commitConfig();
            for (const tabName of tabOrdering.local) {
              await commitHomebaseTab(tabName);
            }
          },
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

export default Homebase;
