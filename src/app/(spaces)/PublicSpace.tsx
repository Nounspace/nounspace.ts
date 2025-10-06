"use client";

import React from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import TabBar from "@/common/components/organisms/TabBar";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";
import { useAppStore } from "@/common/data/stores/app";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialSpaceConfig";
import Profile from "@/fidgets/ui/profile";
import Channel from "@/fidgets/ui/channel";
import { useWallets } from "@privy-io/react-auth";
import { indexOf, isNil, mapValues, noop, debounce } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { SpaceConfigSaveDetails } from "./Space";
import SpaceLoading from "./SpaceLoading";
import SpacePage from "./SpacePage";
import {
  SpacePageData,
  isProfileSpace,
  isTokenSpace,
  isProposalSpace,
  isChannelSpace,
} from "@/common/types/spaceData";
const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

interface PublicSpaceProps {
  spacePageData: SpacePageData;
  tabName: string;
}

export default function PublicSpace({
  spacePageData,
  tabName: providedTabName,
}: PublicSpaceProps) {

  const {
    clearLocalSpaces,
    getCurrentSpaceId,
    setCurrentSpaceId,
    getCurrentTabName,
    setCurrentTabName,
    loadEditableSpaces,
    localSpaces,
    remoteSpaces,
    loadSpaceTab,
    saveLocalSpaceTab,
    commitSpaceTab,
    getCurrentSpaceConfig,
    loadSpaceTabOrder,
    updateSpaceTabOrder,
    commitSpaceTabOrder,
    createSpaceTab,
    deleteSpaceTab,
    registerSpaceFid,
    registerSpaceContract,
    registerProposalSpace,
    registerChannelSpace,
  } = useAppStore((state) => ({
    clearLocalSpaces: state.clearLocalSpaces,
    getCurrentSpaceId: state.currentSpace.getCurrentSpaceId,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    getCurrentTabName: state.currentSpace.getCurrentTabName,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
    currentSpaceId: state.currentSpace.currentSpaceId,
    currentTabName: state.currentSpace.currentTabName,
    localSpaces: state.space.localSpaces,
    remoteSpaces: state.space.remoteSpaces,
    loadEditableSpaces: state.space.loadEditableSpaces,
    getCurrentSpaceConfig: state.currentSpace.getCurrentSpaceConfig,
    loadSpaceTab: state.space.loadSpaceTab,
    createSpaceTab: state.space.createSpaceTab,
    deleteSpaceTab: state.space.deleteSpaceTab,
    saveLocalSpaceTab: state.space.saveLocalSpaceTab,
    commitSpaceTab: state.space.commitSpaceTabToDatabase,
    loadSpaceTabOrder: state.space.loadSpaceTabOrder,
    updateSpaceTabOrder: state.space.updateLocalSpaceOrder,
    commitSpaceTabOrder: state.space.commitSpaceOrderToDatabase,
    registerSpaceFid: state.space.registerSpaceFid,
    registerSpaceContract: state.space.registerSpaceContract,
    registerProposalSpace: state.space.registerProposalSpace,
    registerChannelSpace: state.space.registerChannelSpace,
  }));

  const router = useRouter();

  const initialLoading =
    spacePageData.spaceId !== undefined &&
    spacePageData.spaceId !== "" &&
    !localSpaces[spacePageData.spaceId];

  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { wallets } = useWallets();
  // Clear cache only when switching to a different space
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    if (currentSpaceId !== spacePageData.spaceId) {
      clearLocalSpaces();
      loadedTabsRef.current = {};
      initialDataLoadRef.current = false;
    }
  }, [clearLocalSpaces, getCurrentSpaceId, spacePageData.spaceId]);

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  // Use isEditable logic from spaceData
  const isEditable = useMemo(() => {
    const result = spacePageData.isEditable(
      currentUserFid || undefined, 
      wallets.map((w) => ({ address: w.address as Address }))
    );
    
    return result;
  }, [spacePageData, currentUserFid, wallets]);

  // Control to avoid infinite space/tab update cycles
  const prevSpaceId = useRef<string | null>(null);
  const prevTabName = useRef<string | null>(null);

  useEffect(() => {
    // Reset initialDataLoadRef only when switching spaces
    if (prevSpaceId.current !== spacePageData.spaceId) {
      initialDataLoadRef.current = false;
    }
    
    let nextSpaceId = spacePageData.spaceId;
    let nextTabName = providedTabName ? decodeURIComponent(providedTabName) : spacePageData.defaultTab;

    const localSpacesSnapshot = localSpaces;

    if (isTokenSpace(spacePageData) && spacePageData.contractAddress && spacePageData.tokenData?.network) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (space) =>
          space.contractAddress === spacePageData.contractAddress &&
          space.network === spacePageData.tokenData?.network,
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(providedTabName);
      }
    } else if (isProfileSpace(spacePageData) && spacePageData.spaceOwnerFid) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (space) => space.fid === spacePageData.spaceOwnerFid,
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(providedTabName);
      }
    } else if (isProposalSpace(spacePageData)) {
      // For proposal spaces, use the spacePageData.spaceId directly if it exists
      if (spacePageData.spaceId) {
        nextSpaceId = spacePageData.spaceId;
        nextTabName = decodeURIComponent(providedTabName);
      }
    }

    // Convert undefined to null for store compatibility
    setCurrentSpaceId(nextSpaceId ?? null);
    prevSpaceId.current = nextSpaceId ?? null;
    setCurrentTabName(nextTabName);
    prevTabName.current = nextTabName;
    // localSpaces is not in the dependencies!
  }, [
    spacePageData.spaceType,
    spacePageData.spaceId,
    providedTabName,
  ]);

  // Function to load remaining tabs
  const loadRemainingTabs = useCallback(
    async (spaceId: string) => {
      const currentTabName = getCurrentTabName() ?? spacePageData.defaultTab;
      const tabOrder = localSpaces[spaceId]?.order || [];
      
      // Initialize the set of loaded tabs for this space if it doesn't exist
      if (!loadedTabsRef.current[spaceId]) {
        loadedTabsRef.current[spaceId] = new Set();
      }
      
      // Mark the current tab as loaded
      loadedTabsRef.current[spaceId].add(currentTabName);
      
      // Load only tabs that haven't been loaded yet
      const tabsToLoad = tabOrder.filter(
        (tabName) => tabName !== currentTabName && !loadedTabsRef.current[spaceId].has(tabName)
      );
      
      // Load the remaining tabs in parallel and mark them as loaded
      if (tabsToLoad.length > 0) {
        await Promise.all(
          tabsToLoad.map(async (tabName) => {
            await loadSpaceTab(spaceId, tabName, currentUserFid || undefined);
            loadedTabsRef.current[spaceId].add(tabName);
          })
        );
      }
    },
    [localSpaces, getCurrentTabName, loadSpaceTab, currentUserFid],
  );

  // Track if initial data load already happened
  const initialDataLoadRef = useRef(
    spacePageData.spaceId !== undefined && !!localSpaces[spacePageData.spaceId],
  );
  const isLoadingRef = useRef(false);
  // Keeps track of which tabs have already been loaded for each space
  const loadedTabsRef = useRef<Record<string, Set<string>>>({});
  
  // Loads and sets up the user's space tab when spacePageData.spaceId or providedTabName changes
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";
    
// Avoid repeated simultaneous loading or when reloading is not necessary
    if (isLoadingRef.current) {
      return;
    }

    if (!isNil(currentSpaceId)) {
      let loadPromise;
      
      if (!initialDataLoadRef.current) {
        // First load - load everything from the database
        isLoadingRef.current = true;
        setLoading(true);
        loadPromise = loadSpaceTabOrder(currentSpaceId)
          .then(() => {
            return loadEditableSpaces();
          })
          .then(() => {
            // Load the current tab from the database
            return loadSpaceTab(currentSpaceId, currentTabName, currentUserFid || undefined);
          });
      } else {
        // Navigation between tabs - check if we already have the tab in local cache
        const tabExists = localSpaces[currentSpaceId]?.tabs?.[currentTabName];
        // Also check if the tab is marked as loaded in our registry
        const isTabCached = loadedTabsRef.current[currentSpaceId]?.has(currentTabName);

        if (tabExists && isTabCached) {
          setLoading(false);
          isLoadingRef.current = false;
          loadPromise = Promise.resolve();
          
          // Ensure that the tab is registered as loaded
          if (!loadedTabsRef.current[currentSpaceId]) {
            loadedTabsRef.current[currentSpaceId] = new Set();
          }
          loadedTabsRef.current[currentSpaceId].add(currentTabName);
        } else {
          // Tab not available, need to load from database
          setLoading(true);
          isLoadingRef.current = true;
          loadPromise = loadSpaceTab(currentSpaceId, currentTabName, currentUserFid || undefined);
        }
      }
      
      loadPromise
        .then(() => {
          setLoading(false);
          isLoadingRef.current = false;
          initialDataLoadRef.current = true;
          
          // Mark the current tab as loaded in our registry
          if (currentSpaceId) {
            if (!loadedTabsRef.current[currentSpaceId]) {
              loadedTabsRef.current[currentSpaceId] = new Set();
            }
            loadedTabsRef.current[currentSpaceId].add(currentTabName);
          }
          
          // Load remaining tabs in the background if necessary
          if (currentSpaceId && !initialDataLoadRef.current) {
            void loadRemainingTabs(currentSpaceId);
          }
        })
        .catch((error) => {
          console.error("Error loading space:", error);
          setLoading(false);
          isLoadingRef.current = false;
        });
    }
  }, [getCurrentSpaceId, getCurrentTabName, loadSpaceTabOrder, loadEditableSpaces, loadSpaceTab, loadRemainingTabs]);

  // Checks if the user is signed into Farcaster
  useEffect(() => {
    authManagerGetInitializedAuthenticators().then((authNames) => {
      setIsSignedIntoFarcaster(
        indexOf(authNames, FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME) > -1,
      );
    });
  }, [authManagerLastUpdatedAt]);

  // Loads the current user's FID if they're signed into Farcaster
  useEffect(() => {
    if (!isSignedIntoFarcaster) return;
    authManagerCallMethod({
      requestingFidgetId: "root",
      authenticatorId: FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME,
      methodName: "getAccountFid",
      isLookup: true,
    }).then((authManagerResp) => {
      if (authManagerResp.result === "success") {
        setCurrentUserFid(authManagerResp.value as number);
      }
    });
  }, [isSignedIntoFarcaster, authManagerLastUpdatedAt]);

  const currentConfig = getCurrentSpaceConfig();
  if (!currentConfig) {
    console.error("Current space config is undefined");
  }

  const config = {
    ...(currentConfig?.tabs[getCurrentTabName() ?? spacePageData.defaultTab]
      ? currentConfig.tabs[getCurrentTabName() ?? spacePageData.defaultTab]
      : { ...spacePageData.config }),
    isEditable,
  };

  const memoizedConfig = useMemo(() => {
    if (!config) {
      console.error("Config is undefined");
      return {
        ...spacePageData.config,
        isEditable: false
      };
    }
    return config;
  }, [
    Object.keys(config?.fidgetInstanceDatums || {}).sort().join(','),
    config?.layoutID,
    config?.layoutDetails,
    config?.isEditable,
    config?.fidgetTrayContents,
    config?.theme,
    spacePageData.config,
  ]);

  // Update the space registration effect to use the new editability check
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    
    if (
      isEditable &&
      isNil(currentSpaceId) &&
      !isNil(currentUserFid) &&
      !loading
    ) {

      const registerSpace = async () => {
        try {
          let newSpaceId: string | undefined;
          let newUrl: string | undefined;

          // First check local spaces for existing space
          if (isTokenSpace(spacePageData) && spacePageData.contractAddress && spacePageData.tokenData?.network) {
            const existingSpace = Object.values(localSpaces).find(
              (space) =>
                space.contractAddress === spacePageData.contractAddress &&
                space.network === spacePageData.tokenData?.network,
            );

            if (existingSpace) {
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName(spacePageData.defaultTab);
              return;
            }
          } else if (isProposalSpace(spacePageData)) {
            // For proposal spaces, if we have a spaceId, use it directly
            if (spacePageData.spaceId) {
              setCurrentSpaceId(spacePageData.spaceId);
              setCurrentTabName(spacePageData.defaultTab);
              return;
            }
          } else if (isChannelSpace(spacePageData) && spacePageData.channelId) {
            const existingSpace = Object.values(localSpaces).find(
              (space) => space.channelId && space.channelId === spacePageData.channelId,
            );

            if (existingSpace) {
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName(spacePageData.defaultTab);
              return;
            }
          } else if (isProfileSpace(spacePageData)) {
            const existingSpace = Object.values(localSpaces).find(
              (space) => space.fid === currentUserFid,
            );

            if (existingSpace) {
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName(spacePageData.defaultTab);
              return;
            }
          }

          if (isTokenSpace(spacePageData) && spacePageData.contractAddress && spacePageData.tokenData?.network) {
            newSpaceId = await registerSpaceContract(
              spacePageData.contractAddress,
              spacePageData.defaultTab,
              currentUserFid,
              spacePageData.config,
              spacePageData.tokenData?.network,
            );
          } else if (isProposalSpace(spacePageData)) {
            newSpaceId = await registerProposalSpace(
              spacePageData.proposalId,
              spacePageData.config,
            );
          } else if (isProfileSpace(spacePageData) && !isNil(currentUserFid)) {
            newSpaceId = await registerSpaceFid(
              currentUserFid,
              spacePageData.defaultTab,
              spacePageData.spacePageUrl(spacePageData.defaultTab),
            );
          } else if (isChannelSpace(spacePageData) && !isNil(currentUserFid)) {
            const displayName = spacePageData.channelDisplayName || spacePageData.channelId;
            const moderatorFids = spacePageData.moderatorFids || [];
            
            newSpaceId = await registerChannelSpace(
              spacePageData.channelId,
              displayName,
              currentUserFid,
              spacePageData.spacePageUrl(spacePageData.defaultTab),
              moderatorFids,
            );
          }

          if (newSpaceId) {
            // Set both spaceId and currentSpaceId atomically
            setCurrentSpaceId(newSpaceId);
            setCurrentTabName(spacePageData.defaultTab);

            // Load the space data after registration
            await loadSpaceTabOrder(newSpaceId);
            await loadEditableSpaces(); // First load
            await loadSpaceTab(newSpaceId, spacePageData.defaultTab);

            // Load remaining tabs
            const tabOrder = localSpaces[newSpaceId]?.order || [];
            for (const tabName of tabOrder) {
              if (tabName !== spacePageData.defaultTab) {
                await loadSpaceTab(newSpaceId, tabName);
              }
            }

            // Invalidate cache by reloading editable spaces
            await loadEditableSpaces(); // Second load to invalidate cache

            newUrl = spacePageData.spacePageUrl(spacePageData.defaultTab);
            router.replace(newUrl);
          }
        } catch (error) {
          console.error("Error during space registration:", error);
          console.error("Registration error details:", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            spaceType: spacePageData.spaceType,
            proposalId: isProposalSpace(spacePageData) ? spacePageData.proposalId : undefined,
          });
        }
      };

      registerSpace();
    }
  }, [
    isEditable,
    currentUserFid,
    loading,
    getCurrentSpaceId,
    getCurrentTabName,
    localSpaces,
    spacePageData,
    registerProposalSpace,
    registerSpaceContract,
    registerSpaceFid,
    registerChannelSpace,
    router,
    spacePageData.spacePageUrl,
    spacePageData.config,
  ]);

  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfigSaveDetails) => {
      const currentSpaceId = getCurrentSpaceId();
      const currentTabName = getCurrentTabName() ?? spacePageData.defaultTab;

      if (isNil(currentSpaceId)) {
        throw new Error("Cannot save config until space is registered");
      }
      const saveableConfig = {
        ...spaceConfig,
        fidgetInstanceDatums: spaceConfig.fidgetInstanceDatums
          ? mapValues(spaceConfig.fidgetInstanceDatums, (datum) => ({
            ...datum,
            config: {
              settings: datum.config.settings,
              editable: datum.config.editable,
            },
          }))
          : undefined,
        isPrivate: false,
      };
      return saveLocalSpaceTab(currentSpaceId, currentTabName, saveableConfig);
    },
    [getCurrentSpaceId, getCurrentTabName, config.fidgetInstanceDatums]
  );

  const commitConfig = useCallback(async () => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? spacePageData.defaultTab;

    if (isNil(currentSpaceId)) return;
    const network = isTokenSpace(spacePageData) ? spacePageData.tokenData?.network : undefined;
    commitSpaceTab(currentSpaceId, currentTabName, network);
  }, [getCurrentSpaceId, getCurrentTabName, spacePageData]);

  const resetConfig = useCallback(async () => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? spacePageData.defaultTab;

    if (isNil(currentSpaceId)) return;
    
    let configToSave;
    if (isNil(remoteSpaces[currentSpaceId])) {
      configToSave = {
        ...spacePageData.config,
        isPrivate: false,
      };
    } else {
      const remoteConfig = remoteSpaces[currentSpaceId].tabs[currentTabName];
      configToSave = {
        ...remoteConfig,
      };
    }
    
    saveLocalSpaceTab(currentSpaceId, currentTabName, configToSave);
  }, [getCurrentSpaceId, spacePageData.config, remoteSpaces, getCurrentTabName]);

  // Tab switching function with proper memoization
  const switchTabTo = useCallback(async (tabName: string, shouldSave: boolean = true) => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? spacePageData.defaultTab;

    // Protect against fast navigation: ignore if there is no space or tab
    if (!currentSpaceId || !tabName) return;

    // Update tab name and navigate instantly
    setCurrentTabName(tabName);
    router.push(spacePageData.spacePageUrl(tabName));

    // Save and commit in background if needed
    if (shouldSave) {
      try {
        const resolvedConfig = await config;
        await Promise.all([
          saveLocalSpaceTab(currentSpaceId, currentTabName, resolvedConfig),
          commitSpaceTab(
            currentSpaceId, 
            currentTabName, 
            isTokenSpace(spacePageData) ? spacePageData.tokenData?.network : undefined
          )
        ]);
      } catch (err) {
        console.error("Error saving/committing tab:", err);
      }
    }

    // Check if tab exists and if it is already loaded
    const tabExists = localSpaces[currentSpaceId]?.tabs?.[tabName];
    const tabLoaded = loadedTabsRef.current[currentSpaceId]?.has(tabName) ?? false;

    // Protect against race condition: only execute if component is mounted
    let isMounted = true;
    setLoading(true);
    try {
      if (!tabExists) {
        if (!loadedTabsRef.current[currentSpaceId]) {
          loadedTabsRef.current[currentSpaceId] = new Set();
        }
        loadedTabsRef.current[currentSpaceId].add(tabName);
        await loadSpaceTab(currentSpaceId, tabName, currentUserFid || undefined);
      } else if (tabExists && !tabLoaded) {
        if (!loadedTabsRef.current[currentSpaceId]) {
          loadedTabsRef.current[currentSpaceId] = new Set();
        }
        loadedTabsRef.current[currentSpaceId].add(tabName);
      }
    } catch (err) {
      if (isMounted) {
        console.error("Error loading tab:", err);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
    // Clear flag on unmount
    return () => { isMounted = false; };
  }, [
    getCurrentSpaceId,
    getCurrentTabName,
    spacePageData.spacePageUrl,
    router,
    saveLocalSpaceTab,
    commitSpaceTab,
    spacePageData,
    localSpaces,
    loadSpaceTab,
    currentUserFid,
    config,
    setCurrentTabName,
    setLoading
  ]);

  // Debounce tab switching to prevent rapid clicks
  const debouncedSwitchTabTo = useMemo(
    () => debounce((tabName: string, shouldSave: boolean = true) => {
      switchTabTo(tabName, shouldSave);
    }, 150),
    [switchTabTo]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => debouncedSwitchTabTo.cancel();
  }, [debouncedSwitchTabTo]);

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      isTokenPage={isTokenSpace(spacePageData)}
      inHomebase={false}
      currentTab={getCurrentTabName() ?? spacePageData.defaultTab}
      tabList={
        getCurrentSpaceId()
          ? localSpaces[getCurrentSpaceId()!]?.order
          : [spacePageData.defaultTab]
      }
      contractAddress={isTokenSpace(spacePageData) ? spacePageData.contractAddress as Address : undefined}
      switchTabTo={debouncedSwitchTabTo}
      updateTabOrder={async (newOrder) => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId
          ? updateSpaceTabOrder(currentSpaceId, newOrder)
          : undefined;
      }}
      inEditMode={editMode}
      deleteTab={async (tabName) => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId
          ? deleteSpaceTab(
            currentSpaceId,
            tabName,
            isTokenSpace(spacePageData) ? spacePageData.tokenData?.network as EtherScanChainName : undefined,
          )
          : undefined;
      }}
      createTab={async (tabName) => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId
          ? createSpaceTab(
            currentSpaceId,
            tabName,
            INITIAL_SPACE_CONFIG_EMPTY,
            isTokenSpace(spacePageData) ? spacePageData.tokenData?.network as EtherScanChainName : undefined,
          )
          : undefined;
      }}
      renameTab={async (oldName, newName) => {
        const currentSpaceId = getCurrentSpaceId();
        if (currentSpaceId) {
          const resolvedConfig = await config;
          return saveLocalSpaceTab(
            currentSpaceId,
            oldName,
            resolvedConfig,
            newName,
          );
        }
        return undefined;
      }}
      commitTab={async (tabName) => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId
          ? commitSpaceTab(
              currentSpaceId, 
              tabName, 
              isTokenSpace(spacePageData) ? spacePageData.tokenData?.network : undefined
            )
          : undefined;
      }}
      commitTabOrder={async () => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId
          ? commitSpaceTabOrder(
            currentSpaceId,
            isTokenSpace(spacePageData) ? spacePageData.tokenData?.network as EtherScanChainName : undefined,
          )
          : undefined;
      }}
      getSpacePageUrl={spacePageData.spacePageUrl}
      isEditable={isEditable}
    />
  );

  const headerFidget = isProfileSpace(spacePageData) && spacePageData.spaceOwnerFid ? (
    <Profile.fidget
      settings={{ fid: spacePageData.spaceOwnerFid }}
      saveData={async () => noop()}
      data={{}}
    />
  ) : isChannelSpace(spacePageData) && spacePageData.channelId ? (
    <Channel.fidget
      settings={{ channelId: spacePageData.channelId }}
      saveData={async () => noop()}
      data={{}}
    />
  ) : undefined;

  const MemoizedSpacePage = useMemo(() => (
    <SpacePage
      config={memoizedConfig}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      tabBar={tabBar}
      profile={headerFidget ?? undefined}
    />
  ), [memoizedConfig, saveConfig, commitConfig, resetConfig, tabBar, headerFidget]);
  
  // Shows the skeleton only during initial space loading, not during tab switching
  const shouldShowSkeleton =
    loading &&
    // Show skeleton only when we haven't loaded initial data yet
    !initialDataLoadRef.current &&
    // Don't show skeleton for navigation between tabs
    spacePageData.spaceId !== undefined && spacePageData.spaceId !== "" &&
    // Avoid showing skeleton for tabs that have already been loaded
    !(loadedTabsRef.current[getCurrentSpaceId() ?? ""] && 
      loadedTabsRef.current[getCurrentSpaceId() ?? ""].has(getCurrentTabName() ?? spacePageData.defaultTab));

  if (shouldShowSkeleton) {
    return (
      <div className="user-theme-background w-full h-full relative flex-col">
        <div className="w-full transition-all duration-100 ease-out">
          <div className="flex flex-col h-full">
            {headerFidget ? (
              <div className="z-50 bg-white md:h-40">{headerFidget}</div>
            ) : null}
            <TabBarSkeleton />
            <div className="flex h-full">
              <div className="grow">
                <SpaceLoading
                  hasProfile={!!headerFidget}
                  hasFeed={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return MemoizedSpacePage;
}