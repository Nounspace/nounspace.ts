"use client";

import React, { useEffect, useMemo, lazy } from "react";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import FeedModule from "@/fidgets/farcaster/Feed";
import { FilterType } from "@/fidgets/farcaster/feedConstants";
import { isNil, noop } from "lodash";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";
import { useRouter } from "next/navigation";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import { HOMEBASE_ID } from "@/common/data/stores/app/currentSpace";
import { LoginModal } from "@privy-io/react-auth";
import { FeedType } from "@neynar/nodejs-sdk/build/api";

// Lazy load the TabBar component to improve performance
const TabBar = lazy(() => import('@/common/components/organisms/TabBar'));

// Main component for the private space
function PrivateSpace({ tabName, castHash }: { tabName: string; castHash?: string }) {
  // Destructure and retrieve various state and actions from the app store
  const {
    tabConfigs,
    homebaseConfig,
    currentSpaceId,
    tabOrdering,
    loadTab,
    saveTab,
    commitTab,
    resetTab,
    saveConfig,
    loadFeedConfig,
    commitConfig,
    resetConfig,
    setCurrentSpaceId,
    setCurrentTabName,
    loadTabNames,
    getIsAccountReady,
    loadTabOrder,
    updateTabOrder,
    createTab: originalCreateTab,
    deleteTab,
    renameTab,
    commitTabOrder,
    setModalOpen,
  } = useAppStore((state) => ({
    tabConfigs: state.homebase.tabs,
    homebaseConfig: state.homebase.homebaseConfig,
    currentSpaceId: state.currentSpace.currentSpaceId,
    tabOrdering: state.homebase.tabOrdering,
    loadTab: state.homebase.loadHomebaseTab,
    saveTab: state.homebase.saveHomebaseTabConfig,
    commitTab: state.homebase.commitHomebaseTabToDatabase,
    resetTab: state.homebase.resetHomebaseTabConfig,
    saveConfig: state.homebase.saveHomebaseConfig,
    loadFeedConfig: state.homebase.loadHomebase,
    commitConfig: state.homebase.commitHomebaseToDatabase,
    resetConfig: state.homebase.resetHomebaseConfig,
    getIsAccountReady: state.getIsAccountReady,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
    loadTabNames: state.homebase.loadTabNames,
    loadTabOrder: state.homebase.loadTabOrdering,
    updateTabOrder: state.homebase.updateTabOrdering,
    commitTabOrder: state.homebase.commitTabOrderingToDatabase,
    createTab: state.homebase.createTab,
    deleteTab: state.homebase.deleteTab,
    renameTab: state.homebase.renameTab,
    setModalOpen: state.setup.setModalOpen,
  }));

  const router = useRouter(); // Hook for navigation
  const isLoggedIn = getIsAccountReady(); // Check if the user is logged in
  const currentFid = useCurrentFid(); // Get the current FID

  // Remove onboarding fidgets when the user is logged out
  const sanitizedHomebaseConfig = useMemo(() => {
    if (!homebaseConfig) return undefined;
    if (isLoggedIn) return homebaseConfig;
    return {
      ...homebaseConfig,
      layoutDetails: {
        ...homebaseConfig.layoutDetails,
        layoutConfig: {
          ...homebaseConfig.layoutDetails.layoutConfig,
          layout: [],
        },
      },
      fidgetInstanceDatums: {},
      fidgetTrayContents: [],
    };
  }, [homebaseConfig, isLoggedIn]);

  const { editMode } = useSidebarContext(); // Get the edit mode status from the sidebar context

  // Effect to handle login modal when user is not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      // Open the login modal if user is not logged in
      setModalOpen(true);
    }
  }, [isLoggedIn, setModalOpen]);

  // Effect to set the current space and tab name, and load the tab configuration
  useEffect(() => {
    setCurrentSpaceId(HOMEBASE_ID);
    setCurrentTabName(tabName);
    if (!isNil(tabName)) {
      loadTabConfig();
    }
  }, []);

  // Function to load the configuration for the current tab
  async function loadTabConfig() {
    await loadTabNames();

    if (tabOrdering.local.length === 0) {
      await loadTabOrder();
    }

    if (tabName === "Feed") {
      await loadFeedConfig();
    } else {
      await loadTab(tabName);
    }

    // After the current tab is loaded, preload other tabs in the background
    void loadRemainingTabs();
  }

  // Preload all tabs except the current one
  async function loadRemainingTabs() {
    const otherTabs = tabOrdering.local.filter((name) => name !== tabName);
    await Promise.all(
      otherTabs.map((name) =>
        name === "Feed" ? loadFeedConfig() : loadTab(name),
      ),
    );
  }

  // Function to switch to a different tab
  async function switchTabTo(newTabName: string, shouldSave: boolean = true) {
    if (shouldSave) {
      await commitConfigHandler();
    }

    if (newTabName === "Feed") {
      router.push(`/homebase`);
    } else {
      router.push(`/homebase/${newTabName}`);
    }
  }

  // Function to get the URL for a given tab
  function getSpacePageUrl(tabName: string) {
    if (tabName === "Feed") {
      return `/homebase`;
    }
    return `/homebase/${tabName}`;
  }

  // Handler to reset the configuration for the current tab
  const resetConfigHandler = async () => {
    if (tabName === "Feed") {
      return resetConfig();
    } else {
      return resetTab(tabName);
    }
  };

  // Handler to commit the configuration for the current tab
  const commitConfigHandler = async () => {
    if (tabName === "Feed") {
      return commitConfig();
    } else {
      return commitTab(tabName);
    }
  };

  // Handler to save the configuration for the current tab
  const saveConfigHandler = async (configToSave) => {
    if (tabName === "Feed") {
      await saveConfig(configToSave);
    } else {
      await saveTab(tabName, configToSave);
    }
  };

  // Wrap createTab to return the expected type
  // THIS IS A HACK TO FIX THE TYPE ERROR
  // TODO: UPDATE PRIVATE SPACE TO USE THE OPTIMISTIC UPDATES THAT ARE IN PUBLIC SPACE
  const createTab = async (tabName: string) => {
    await originalCreateTab(tabName);
    return { tabName };
  };

  // Memoize the TabBar component to prevent unnecessary re-renders
  const tabBar = useMemo(() => (
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
  ), [tabName, tabOrdering.local, editMode]);

  // Define the arguments for the SpacePage component
  const args: SpacePageArgs = useMemo(() => ({
    config: (() => {
      const sourceConfig =
        tabName === "Feed"
          ? sanitizedHomebaseConfig
          : tabConfigs[tabName]?.config;
      const { timestamp, ...restConfig } = {
        ...(sourceConfig ?? INITIAL_SPACE_CONFIG_EMPTY),
        isEditable: true,
      };
      return restConfig;
    })(),
    saveConfig: saveConfigHandler,
    commitConfig: commitConfigHandler,
    resetConfig: resetConfigHandler,
    tabBar: tabBar,
    feed: tabName === "Feed" ? (
      <FeedModule.fidget
        settings={{
          feedType: FeedType.Following,
          users: "",
          filterType: FilterType.Users,
          selectPlatform: { name: "Farcaster", icon: "/images/farcaster.jpeg" },
          Xhandle: "",
          style: "",
          fontFamily: "var(--user-theme-font)",
          fontColor: "var(--user-theme-font-color)" as any,
        }}
        saveData={async () => noop()}
        data={{ initialHash: castHash, updateUrl: true }}
      />
    ) : undefined,
  }), [
    tabName,
    tabName === "Feed"
      ? sanitizedHomebaseConfig
      : tabConfigs[tabName]?.config,
    tabOrdering.local,
    editMode,
    castHash,
  ]);


  // Render the SpacePage component with the defined arguments
  return (
    <SpacePage key={tabName} {...args} />
  );
}

export default PrivateSpace; 