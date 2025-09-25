"use client";

import React, { useEffect, useMemo, useCallback, lazy, useTransition } from "react";
import { useAppStore } from "@/common/data/stores/app";
import SpacePage, { SpacePageArgs } from "@/app/(spaces)/SpacePage";
import FeedModule, { FilterType } from "@/fidgets/farcaster/Feed";
import { isNil, noop } from "lodash";
import { useRouter } from "next/navigation";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialSpaceConfig";
import { HOMEBASE_ID } from "@/common/data/stores/app/currentSpace";
import { FeedType } from "@neynar/nodejs-sdk/build/api";

// Lazy load the TabBar component to improve performance
const TabBar = lazy(() => import('@/common/components/organisms/TabBar'));

// Main component for the private space
function PrivateSpace({ tabName, castHash }: { tabName: string; castHash?: string }) {
  const [_isPending, startTransition] = useTransition();
  
  // Destructure and retrieve various state and actions from the app store
  const {
    tabConfigs,
    homebaseConfig,
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

  const { editMode } = useSidebarContext(); // Get the edit mode status from the sidebar context

  // Effect to handle login modal when user is not logged in
  // If a specific cast is being viewed, allow it without forcing a login
  useEffect(() => {
    if (!isLoggedIn && !castHash) {
      // Open the login modal if user is not logged in
      setModalOpen(true);
    }
  }, [isLoggedIn, setModalOpen, castHash]);

  // Effect to set the current space and tab name, and load the tab configuration
  useEffect(() => {
    setCurrentSpaceId(HOMEBASE_ID);
    setCurrentTabName(tabName);
    if (!isNil(tabName)) {
      // For Feed tab, ensure we have the homebase config loaded first
      if (tabName === "Feed" && !homebaseConfig) {
        // Try to load homebase config first before proceeding
        loadFeedConfig().then(() => loadTabConfigAsync());
      } else {
        loadTabConfigAsync();
      }
    }
  }, [tabName, setCurrentSpaceId, setCurrentTabName, homebaseConfig]);

  // Load tab config without blocking the initial render
  function loadTabConfigAsync() {
    startTransition(() => {
      (async () => {
        await loadTabNames();
        // Check current ordering from our local state
        if (tabOrdering.local.length === 0) {
          await loadTabOrder();
        }
        if (tabName === "Feed") {
          await loadFeedConfig();
        } else {
          await loadTab(tabName);
        }
        // Load remaining tabs
        void loadRemainingTabs();
      })().catch(() => {});
    });
  }

  // Preload all tabs except the current one
  async function loadRemainingTabs() {
    // Use the current tabOrdering from component state
    const otherTabs = tabOrdering.local.filter((name) => name !== tabName);
    await Promise.all(
      otherTabs.map((name) =>
        name === "Feed" ? loadFeedConfig() : loadTab(name),
      ),
    );
  }

  // Function to switch to a different tab
  async function switchTabTo(newTabName: string, shouldSave: boolean = true) {
    // Updates the route immediately
    setCurrentTabName(newTabName);
    if (newTabName === "Feed") {
      router.push(`/homebase`);
    } else {
      router.push(`/homebase/${newTabName}`);
    }
    // Save config changes in background
    if (shouldSave) {
      startTransition(() => {
        commitConfigHandler();
      });
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

  // Wrap updateTabOrder to ensure it commits changes
  const updateTabOrderWithCommit = useCallback((newOrder: string[]) => {
    updateTabOrder(newOrder, true); // Force commit when called from TabBar drag-and-drop
  }, [updateTabOrder]);

  // Memoize the TabBar component to prevent unnecessary re-renders
  const tabBar = useMemo(() => (
    <TabBar
      getSpacePageUrl={getSpacePageUrl}
      inHomebase={true}
      currentTab={tabName}
      tabList={tabOrdering.local}
      switchTabTo={switchTabTo}
      updateTabOrder={updateTabOrderWithCommit}
      inEditMode={editMode}
      deleteTab={deleteTab}
      createTab={createTab}
      renameTab={renameTab}
      commitTabOrder={commitTabOrder}
      commitTab={commitTab}
      isEditable={true}
    />
  ), [tabName, tabOrdering.local, editMode, updateTabOrderWithCommit]);

  // Define the arguments for the SpacePage component
  const args: SpacePageArgs = useMemo(() => ({
    config: (() => {
      const sourceConfig =
        tabName === "Feed"
          ? homebaseConfig
          : tabConfigs[tabName]?.config;
      
      // This prevents overwriting custom configurations with the default
      const baseConfig = sourceConfig || INITIAL_SPACE_CONFIG_EMPTY;
      
      // Debug logging to help track configuration issues
      if (process.env.NODE_ENV === 'development' && !sourceConfig) {
        console.warn(`[PrivateSpace] No source config found for tab: ${tabName}`, {
          tabName,
          homebaseConfigExists: !!homebaseConfig,
          tabConfigExists: !!tabConfigs[tabName]?.config,
          tabConfigs: Object.keys(tabConfigs)
        });
      }
      
      const { ...restConfig } = {
        ...baseConfig,
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
    showFeedOnMobile: Boolean(castHash),
  }), [
    tabName,
    tabName === "Feed"
      ? homebaseConfig
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