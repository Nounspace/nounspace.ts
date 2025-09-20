"use client";

import React from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import TabBar from "@/common/components/organisms/TabBar";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";
import { useAppStore } from "@/common/data/stores/app";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import Profile from "@/fidgets/ui/profile";
import { useWallets } from "@privy-io/react-auth";
import { indexOf, isNil, mapValues, noop } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { SpaceConfigSaveDetails } from "./Space";
import { SpaceData, isProfileSpace, isTokenSpace, isProposalSpace } from "@/common/types/spaceData";
import SpaceLoading from "./SpaceLoading";
import SpacePage from "./SpacePage";
const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

interface PublicSpaceProps {
  spaceData: SpaceData;
  tabName: string;
}

export default function PublicSpace({
  spaceData,
  tabName,
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
  }));

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(isNil(spaceData.id) || !localSpaces[spaceData.id]);
  const [currentUserFid, setCurrentUserFid] = useState<number | undefined>(undefined);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { wallets } = useWallets();
  
  // Clear cache when switching to a different space
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    if (currentSpaceId !== spaceData.id) {
      clearLocalSpaces();
      loadedTabsRef.current = {};
      initialDataLoadRef.current = false;
    }
  }, [clearLocalSpaces, getCurrentSpaceId, spaceData.id]);

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  // Each space has its own isEditable logic
  const isEditable = useMemo(() => {
    return spaceData.isEditable(currentUserFid, wallets.map((w) => ({ address: w.address as Address })));
  }, [spaceData, currentUserFid, wallets]);


  // Control to avoid infinite space/tab update cycles
  const prevSpaceId = useRef<string | null>(null);
  const prevTabName = useRef<string | null>(null);

  useEffect(() => {
    // Reset initialDataLoadRef only when switching spaces
    if (prevSpaceId.current !== spaceData.id) {
      initialDataLoadRef.current = false;
    }
    
    let nextSpaceId = spaceData.id;
    let nextTabName = decodeURIComponent(tabName);

    const localSpacesSnapshot = localSpaces;

    if (isTokenSpace(spaceData) && spaceData.tokenData?.network) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (s) =>
          s.contractAddress === spaceData.contractAddress &&
          s.network === spaceData.tokenData?.network,
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(tabName);
      }
    } else if (isProfileSpace(spaceData)) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (s) => s.fid === spaceData.fid,
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(tabName);
      }
    } else if (isProposalSpace(spaceData)) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (s) => s.proposalId === spaceData.proposalId
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        // default to Overview for proposals if tab is missing
        nextTabName = decodeURIComponent(tabName || 'Overview');
      }
    }

    // Convert undefined to null for store compatibility
    setCurrentSpaceId(nextSpaceId ?? null);
    prevSpaceId.current = nextSpaceId ?? null;
    setCurrentTabName(nextTabName);
    prevTabName.current = nextTabName;
    // localSpaces is not in the dependencies!
  }, [
    spaceData,
    spaceData.id,
    tabName,
    isTokenSpace(spaceData) ? spaceData.tokenData?.network : undefined,
    setCurrentSpaceId,
    setCurrentTabName,
  ]);

  // Function to load remaining tabs
  const loadRemainingTabs = useCallback(
    async (spaceId: string) => {
      const currentTabName = getCurrentTabName() ?? "Profile";
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
    spaceData.id !== null && spaceData.id !== undefined && !!localSpaces[spaceData.id],
  );
  const isLoadingRef = useRef(false);
  // Keeps track of which tabs have already been loaded for each space
  const loadedTabsRef = useRef<Record<string, Set<string>>>({});
  
  // Loads and sets up the user's space tab when space.id or providedTabName changes
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
    ...(currentConfig?.tabs[getCurrentTabName() ?? "Profile"]
      ? currentConfig.tabs[getCurrentTabName() ?? "Profile"]
      : { ...spaceData.config }),
    isEditable,
  };

  const memoizedConfig = useMemo(() => {
    if (!config) {
      console.error("Config is undefined");
      // Add isEditable property to INITIAL_SPACE_CONFIG_EMPTY
      return {
        ...INITIAL_SPACE_CONFIG_EMPTY,
        isEditable
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
  ]);

  // Update the space registration effect to use the new editability check
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();

    // Attempt registration when space is missing and user is identified
    if (
      isEditable &&
      isNil(currentSpaceId) &&
      !isNil(currentUserFid) &&
      !loading
    ) {

      const registerSpace = async () => {
        try {
          let newSpaceId: string | undefined;

          // First check local spaces for existing space
          if (isTokenSpace(spaceData) && spaceData.tokenData?.network) {
            const existingSpace = Object.values(localSpaces).find(
              (s) =>
                s.contractAddress === spaceData.contractAddress &&
                s.network === spaceData.tokenData?.network,
            );

            if (existingSpace) {
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName("Profile");
              return;
            }
          } else if (isProposalSpace(spaceData)) {
            const existingSpace = Object.values(localSpaces).find(
              s => s.proposalId === spaceData.proposalId
            );

            if (existingSpace) {
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName('Overview');
              return;
            }
          } else if (isProfileSpace(spaceData)) {
            const existingSpace = Object.values(localSpaces).find(
              (s) => s.fid === currentUserFid,
            );

            if (existingSpace) {
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName("Profile");
              return;
            }
          }

          if (isTokenSpace(spaceData) && spaceData.tokenData?.network) {
            newSpaceId = await registerSpaceContract(
              spaceData.contractAddress,
              "Profile",
              currentUserFid,
              spaceData.config,
              spaceData.tokenData.network,
            );
            console.log("Contract space registration result:", {
              success: !!newSpaceId,
              newSpaceId,
              contractAddress: spaceData.contractAddress,
            });
          } else if (isProposalSpace(spaceData)) {
            newSpaceId = await registerProposalSpace(spaceData.proposalId, spaceData.config);
          } else if (isProfileSpace(spaceData)) {
            newSpaceId = await registerSpaceFid(
              spaceData.fid,
              "Profile",
              spaceData.spacePageUrl("Profile"),
            );

            const newUrl = spaceData.spacePageUrl("Profile");
            router.replace(newUrl);
          }

          if (newSpaceId) {
            // Determine initial tab name depending on space type
            const initialTabName = isProposalSpace(spaceData) ? 'Overview' : 'Profile';

            // Set both spaceId and currentSpaceId atomically
            setCurrentSpaceId(newSpaceId);
            setCurrentTabName(initialTabName);

            // Load the space data after registration
            await loadSpaceTabOrder(newSpaceId);
            await loadEditableSpaces(); // First load
            await loadSpaceTab(newSpaceId, initialTabName);

            // Load remaining tabs
            const tabOrder = localSpaces[newSpaceId]?.order || [];
            for (const tabName of tabOrder) {
              if (tabName !== initialTabName) {
                await loadSpaceTab(newSpaceId, tabName);
              }
            }

            // Invalidate cache by reloading editable spaces
            await loadEditableSpaces(); // Second load to invalidate cache

            // Update the URL to include the new space ID
            const newUrl = spaceData.spacePageUrl(initialTabName);
            router.replace(newUrl);
          }
        } catch (error) {
          console.error("Error during space registration:", error);
        }
      };

      registerSpace();
    }
  }, [
    isEditable,
    currentUserFid,
    loading,
    spaceData,
    isTokenSpace(spaceData) ? spaceData.tokenData?.network : undefined,
    getCurrentSpaceId,
    getCurrentTabName,
    localSpaces,
    router,
    registerSpaceContract,
    registerProposalSpace,
    registerSpaceFid,
    loadSpaceTabOrder,
    loadEditableSpaces,
    loadSpaceTab,
    setCurrentSpaceId,
    setCurrentTabName,
  ]);

  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfigSaveDetails) => {
      const currentSpaceId = getCurrentSpaceId();
      const currentTabName = getCurrentTabName() ?? "Profile";

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
    const currentTabName = getCurrentTabName() ?? "Profile";

    if (isNil(currentSpaceId)) return;
    const network = isTokenSpace(spaceData) ? spaceData.tokenData?.network : undefined;
    commitSpaceTab(currentSpaceId, currentTabName, network);
  }, [getCurrentSpaceId, getCurrentTabName, spaceData]);

  const resetConfig = useCallback(async () => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";

    if (isNil(currentSpaceId)) return;
    
    let configToSave;
    if (isNil(remoteSpaces[currentSpaceId])) {
      configToSave = {
        ...INITIAL_SPACE_CONFIG_EMPTY,
        isPrivate: false,
      };
    } else {
      const remoteConfig = remoteSpaces[currentSpaceId].tabs[currentTabName];
      configToSave = {
        ...remoteConfig,
      };
    }
    
    saveLocalSpaceTab(currentSpaceId, currentTabName, configToSave);
  }, [getCurrentSpaceId, spaceData.config, remoteSpaces, getCurrentTabName]);

  // Common tab management
  async function switchTabTo(tabName: string, shouldSave: boolean = true) {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";

    // Update the store immediately for better responsiveness
    setCurrentTabName(tabName);
    
    // Check if we already have the tab in cache
    const tabExists = currentSpaceId && localSpaces[currentSpaceId]?.tabs?.[tabName];
    
    if (currentSpaceId && !tabExists) {
      // Show skeleton when loading a tab from the database
      setLoading(true);
      // Mark as loaded to avoid loading again
      if (loadedTabsRef.current[currentSpaceId]) {
        loadedTabsRef.current[currentSpaceId].add(tabName);
      } else {
        loadedTabsRef.current[currentSpaceId] = new Set([tabName]);
      }

      // Load the tab showing the skeleton for better UX
      loadSpaceTab(currentSpaceId, tabName, currentUserFid || undefined)
        .catch(error => console.error(`Error loading tab ${tabName}:`, error));
    } else if (currentSpaceId && tabExists) {
      // Tab already in cache - no need to show skeleton
      if (!loadedTabsRef.current[currentSpaceId]) {
        loadedTabsRef.current[currentSpaceId] = new Set();
      }
      loadedTabsRef.current[currentSpaceId].add(tabName);
      setLoading(false);
    }

    if (currentSpaceId && shouldSave) {
      const resolvedConfig = await config;
      await saveLocalSpaceTab(currentSpaceId, currentTabName, resolvedConfig);
      const network = isTokenSpace(spaceData) ? spaceData.tokenData?.network : undefined;
      await commitSpaceTab(currentSpaceId, currentTabName, network);
    }
    // Update the URL without triggering a full navigation
    router.push(spaceData.spacePageUrl(tabName));
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      isTokenPage={isTokenSpace(spaceData)}
      pageType={spaceData.spaceType}
      inHomebase={false}
      currentTab={getCurrentTabName() ?? "Profile"}
      tabList={
        getCurrentSpaceId()
          ? localSpaces[getCurrentSpaceId()!]?.order
          : ["Profile"]
      }
      contractAddress={isTokenSpace(spaceData) ? spaceData.contractAddress as Address : undefined}
      switchTabTo={switchTabTo}
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
            isTokenSpace(spaceData) ? spaceData.tokenData?.network as EtherScanChainName : 'mainnet',
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
            isTokenSpace(spaceData) ? spaceData.tokenData?.network as EtherScanChainName : 'mainnet',
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
          ? commitSpaceTab(currentSpaceId, tabName, isTokenSpace(spaceData) ? spaceData.tokenData?.network : undefined)
          : undefined;
      }}
      commitTabOrder={async () => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId
          ? commitSpaceTabOrder(
            currentSpaceId,
            isTokenSpace(spaceData) ? spaceData.tokenData?.network as EtherScanChainName : 'mainnet',
          )
          : undefined;
      }}
      getSpacePageUrl={spaceData.spacePageUrl}
      isEditable={isEditable}
      spaceId={getCurrentSpaceId()}
    />
  );

  // Profile component for profile spaces
  const profile = isProfileSpace(spaceData) ? (
    <Profile.fidget
      settings={{ fid: spaceData.fid }}
      saveData={async () => noop()}
      data={{}}
    />
  ) : undefined;

  if (!profile) {
    console.warn("Profile component is undefined");
  }

  const MemoizedSpacePage = useMemo(() => (
    <SpacePage
      config={memoizedConfig}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      tabBar={tabBar}
      profile={profile ?? undefined}
    />
  ), [memoizedConfig, saveConfig, commitConfig, resetConfig, tabBar, profile]);
  
  // Shows the skeleton only during initial space loading, not during tab switching
  const shouldShowSkeleton =
    loading &&
    // Show skeleton only when we haven't loaded initial data yet
    !initialDataLoadRef.current &&
    // Don't show skeleton for navigation between tabs
    spaceData.id !== null && spaceData.id !== "" &&
    // Avoid showing skeleton for tabs that have already been loaded
    !(loadedTabsRef.current[getCurrentSpaceId() ?? ""] && 
      loadedTabsRef.current[getCurrentSpaceId() ?? ""].has(getCurrentTabName() ?? "Profile"));

  if (shouldShowSkeleton) {
    return (
      <div className="user-theme-background w-full h-full relative flex-col">
        <div className="w-full transition-all duration-100 ease-out">
          <div className="flex flex-col h-full">
            {profile ? (
              <div className="z-50 bg-white md:h-40">{profile}</div>
            ) : null}
            <TabBarSkeleton />
            <div className="flex h-full">
              <div className="grow">
                <SpaceLoading
                  hasProfile={isProfileSpace(spaceData)}
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