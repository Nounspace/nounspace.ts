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
import { useWallets } from "@privy-io/react-auth";
import { indexOf, isNil, mapValues, noop } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { SpaceConfigSaveDetails } from "./Space";
import SpaceLoading from "./SpaceLoading";
import SpacePage from "./SpacePage";
import { useCurrentSpaceIdentityPublicKey } from "@/common/lib/hooks/useCurrentSpaceIdentityPublicKey";
import { SpaceData, isProfileSpace, isTokenSpace, isProposalSpace } from "@/common/types/spaceData";
const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export type SpacePageType = "profile" | "token" | "proposal";

interface PublicSpaceProps {
  spaceData: SpaceData;
  tabName: string;
}

export default function PublicSpace({
  spaceData,
  tabName: providedTabName,
}: PublicSpaceProps) {

  // Extract variables from spaceData to match existing variable names
  const providedSpaceId = spaceData.id;
  const initialConfig = spaceData.config;
  const getSpacePageUrl = spaceData.spacePageUrl;
  
  // Extract ownership props based on space type
  const spaceOwnerFid = isProfileSpace(spaceData) ? spaceData.fid : undefined;
  const _spaceOwnerAddress = isTokenSpace(spaceData) ? spaceData.ownerAddress : 
                           isProposalSpace(spaceData) ? spaceData.ownerAddress : undefined;
  
  // Extract token-specific props
  const isTokenPage = isTokenSpace(spaceData);
  const contractAddress = isTokenSpace(spaceData) ? spaceData.contractAddress : undefined;
  const tokenData = isTokenSpace(spaceData) ? spaceData.tokenData : undefined;
  
  // Determine page type from space type
  const pageType: SpacePageType = isProfileSpace(spaceData) ? "profile" :
                                 isTokenSpace(spaceData) ? "token" :
                                 isProposalSpace(spaceData) ? "proposal" : "profile";

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

  const initialLoading =
    providedSpaceId !== undefined &&
    providedSpaceId !== "" &&
    !localSpaces[providedSpaceId];

  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { wallets } = useWallets();
  const _currentUserIdentityPublicKey = useCurrentSpaceIdentityPublicKey();

  
  // Clear cache only when switching to a different space
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    if (currentSpaceId !== providedSpaceId) {
      clearLocalSpaces();
      loadedTabsRef.current = {};
      initialDataLoadRef.current = false;
    }
  }, [clearLocalSpaces, getCurrentSpaceId, providedSpaceId]);

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  // Use isEditable logic from spaceData
  const isEditable = useMemo(() => {
    return spaceData.isEditable(currentUserFid || undefined, wallets.map((w) => ({ address: w.address as Address })));
  }, [spaceData, currentUserFid, wallets]);

  // Determine the page type if not explicitly provided
  const resolvedPageType = useMemo(() => {
    if (pageType) return pageType;
    if (isTokenPage) return "token";
    if (spaceOwnerFid) return "person";
    if (providedSpaceId?.startsWith("proposal:")) return "proposal";
    return "person"; // Default to person page
  }, [pageType, isTokenPage, spaceOwnerFid, providedSpaceId]);

  // Control to avoid infinite space/tab update cycles
  const prevSpaceId = useRef<string | null>(null);
  const prevTabName = useRef<string | null>(null);

  useEffect(() => {
    // Reset initialDataLoadRef only when switching spaces
    if (prevSpaceId.current !== providedSpaceId) {
      initialDataLoadRef.current = false;
    }
    
    let nextSpaceId = providedSpaceId;
    // Make sure we use the correct default tab if providedTabName is empty or "Profile" for token spaces
    let nextTabName = providedTabName ? decodeURIComponent(providedTabName) : spaceData.defaultTab;
    
    // For token spaces, if the tab is "Profile", use the default tab instead
    if (isTokenSpace(spaceData) && nextTabName === "Profile") {
      nextTabName = spaceData.defaultTab;
    }

    const localSpacesSnapshot = localSpaces;

    if (resolvedPageType === "token" && contractAddress && tokenData?.network) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (space) =>
          space.contractAddress === contractAddress &&
          space.network === tokenData.network,
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(providedTabName);
      }
    } else if (resolvedPageType === "person" && spaceOwnerFid) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (space) => space.fid === spaceOwnerFid,
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(providedTabName);
      }
    } else if (resolvedPageType === "proposal") {
      // For proposal spaces, use the providedSpaceId directly if it exists
      if (providedSpaceId) {
        nextSpaceId = providedSpaceId;
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
    resolvedPageType,
    providedSpaceId,
    providedTabName,
    contractAddress,
    tokenData?.network,
    spaceOwnerFid,
    setCurrentSpaceId,
    setCurrentTabName,
  ]);

  // Function to load remaining tabs
  const loadRemainingTabs = useCallback(
    async (spaceId: string) => {
      const currentTabName = getCurrentTabName() ?? spaceData.defaultTab;
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
    providedSpaceId !== undefined && !!localSpaces[providedSpaceId],
  );
  const isLoadingRef = useRef(false);
  // Keeps track of which tabs have already been loaded for each space
  const loadedTabsRef = useRef<Record<string, Set<string>>>({});
  
  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
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

  const currentSpaceId = getCurrentSpaceId();
  const currentTabName = getCurrentTabName() ?? spaceData.defaultTab;
  
  console.log("[PublicSpace] Getting space config:", {
    currentSpaceId,
    currentTabName,
    initialConfig,
    hasInitialConfig: !!initialConfig,
    spaceDataDefaultTab: spaceData.defaultTab
  });
  
  const currentConfig = getCurrentSpaceConfig();
  console.log("[PublicSpace] Current space config:", {
    hasConfig: !!currentConfig,
    configTabs: currentConfig && currentConfig.tabs ? Object.keys(currentConfig.tabs) : [],
    currentTab: currentTabName,
    isUnregisteredSpace: !currentSpaceId // This is normal for unregistered spaces
  });
  
  // If currentConfig is undefined, we'll use initialConfig directly
  // This is normal for spaces that haven't been registered yet and is not an error
  const config = {
    ...(currentConfig && currentConfig.tabs && currentConfig.tabs[currentTabName]
      ? currentConfig.tabs[currentTabName]
      : { ...initialConfig, isEditable }),
    isEditable,
  };
  
  console.log("[PublicSpace] Resolved config:", {
    usedCurrentConfig: !!(currentConfig && currentConfig.tabs && currentConfig.tabs[currentTabName]),
    usedInitialConfig: !(currentConfig && currentConfig.tabs && currentConfig.tabs[currentTabName]),
    hasConfig: !!config,
    config: config
  });

  const memoizedConfig = useMemo(() => {
    return config;
  }, [
    Object.keys(config?.fidgetInstanceDatums || {}).sort().join(','),
    config?.layoutID,
    config?.layoutDetails,
    config?.isEditable,
    config?.fidgetTrayContents,
    config?.theme,
    initialConfig,
    isEditable
  ]);

  // Update the space registration effect to use the new editability check
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();

    // Attempt registration when space is missing and user is identified
    console.log("[PublicSpace] Space registration check:", {
      isEditable,
      currentSpaceId,
      isCurrentSpaceIdNil: isNil(currentSpaceId),
      currentUserFid,
      isCurrentUserFidNil: isNil(currentUserFid),
      loading,
      shouldRegister: isEditable && isNil(currentSpaceId) && !isNil(currentUserFid) && !loading
    });
    
    if (
      isEditable &&
      isNil(currentSpaceId) &&
      !isNil(currentUserFid) &&
      !loading
    ) {

      const registerSpace = async () => {
        console.log("[PublicSpace] Starting space registration");
        try {
          let newSpaceId: string | undefined;

          // First check local spaces for existing space
          if (isTokenPage && contractAddress && tokenData?.network) {
            const existingSpace = Object.values(localSpaces).find(
              (space) =>
                space.contractAddress === contractAddress &&
                space.network === tokenData.network,
            );

            if (existingSpace) {
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName(spaceData.defaultTab);
              return;
            }
          } else if (resolvedPageType === "proposal") {
            // For proposal spaces, if we have a spaceId, use it directly
            if (providedSpaceId) {
              setCurrentSpaceId(providedSpaceId);
              setCurrentTabName(spaceData.defaultTab);
              return;
            }
          } else if (!isTokenPage) {
            const existingSpace = Object.values(localSpaces).find(
              (space) => space.fid === currentUserFid,
            );

            if (existingSpace) {
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName(spaceData.defaultTab);
              return;
            }
          }

          if (isTokenPage && contractAddress && tokenData?.network) {
            console.log("[PublicSpace] Registering token space:", {
              contractAddress,
              currentUserFid,
              initialConfig,
              hasInitialConfig: !!initialConfig,
              network: tokenData.network
            });
            
            newSpaceId = await registerSpaceContract(
              contractAddress,
              spaceData.defaultTab,
              currentUserFid,
              initialConfig,
              tokenData.network,
            );
          } else if (isProposalSpace(spaceData)) {
            newSpaceId = await registerProposalSpace(
              spaceData.proposalId,
              initialConfig,
            );
          } else if (!isTokenPage) {
            newSpaceId = await registerSpaceFid(
              currentUserFid,
              spaceData.defaultTab,
              getSpacePageUrl(spaceData.defaultTab),
            );

            const newUrl = getSpacePageUrl(spaceData.defaultTab);
            router.replace(newUrl);
          }

          if (newSpaceId) {
            // Set both spaceId and currentSpaceId atomically
            setCurrentSpaceId(newSpaceId);
            setCurrentTabName(spaceData.defaultTab);

            // Load the space data after registration
            await loadSpaceTabOrder(newSpaceId);
            await loadEditableSpaces(); // First load
            await loadSpaceTab(newSpaceId, spaceData.defaultTab);

            // Load remaining tabs
            const tabOrder = localSpaces[newSpaceId]?.order || [];
            for (const tabName of tabOrder) {
              if (tabName !== spaceData.defaultTab) {
                await loadSpaceTab(newSpaceId, tabName);
              }
            }

            // Invalidate cache by reloading editable spaces
            await loadEditableSpaces(); // Second load to invalidate cache

            // Update the URL to include the new space ID
            const newUrl = getSpacePageUrl(spaceData.defaultTab);
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
    isTokenPage,
    contractAddress,
    tokenData?.network,
    getCurrentSpaceId,
    getCurrentTabName,
    localSpaces,
    resolvedPageType,
    spaceData,
    registerProposalSpace,
  ]);

  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfigSaveDetails) => {
      const currentSpaceId = getCurrentSpaceId();
      const currentTabName = getCurrentTabName() ?? spaceData.defaultTab;

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
    commitSpaceTab(currentSpaceId, currentTabName, tokenData?.network);
  }, [getCurrentSpaceId, getCurrentTabName, tokenData?.network]);

  const resetConfig = useCallback(async () => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";

    if (isNil(currentSpaceId)) return;
    
    let configToSave;
    if (isNil(remoteSpaces[currentSpaceId])) {
      configToSave = {
        ...initialConfig,
        isPrivate: false,
      };
    } else {
      const remoteConfig = remoteSpaces[currentSpaceId].tabs[currentTabName];
      configToSave = {
        ...remoteConfig,
      };
    }
    
    saveLocalSpaceTab(currentSpaceId, currentTabName, configToSave);
  }, [getCurrentSpaceId, initialConfig, remoteSpaces, getCurrentTabName]);

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
      await commitSpaceTab(currentSpaceId, currentTabName, tokenData?.network);
    }
    // Update the URL without triggering a full navigation
    router.push(getSpacePageUrl(tabName));
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      isTokenPage={isTokenPage}
      pageType={pageType}
      inHomebase={false}
      currentTab={getCurrentTabName() ?? spaceData.defaultTab}
      tabList={
        getCurrentSpaceId()
          ? localSpaces[getCurrentSpaceId()!]?.order
          : [spaceData.defaultTab]
      }
      contractAddress={contractAddress as Address}
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
            tokenData?.network as EtherScanChainName,
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
            tokenData?.network as EtherScanChainName,
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
          ? commitSpaceTab(currentSpaceId, tabName, tokenData?.network)
          : undefined;
      }}
      commitTabOrder={async () => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId
          ? commitSpaceTabOrder(
            currentSpaceId,
            tokenData?.network as EtherScanChainName,
          )
          : undefined;
      }}
      getSpacePageUrl={getSpacePageUrl}
      isEditable={isEditable}
    />
  );

  // @todo - Use correct page type for profile
  const profile =
    isTokenPage || !spaceOwnerFid || pageType === "proposal" ? undefined : (
      <Profile.fidget
        settings={{ fid: spaceOwnerFid }}
        saveData={async () => noop()}
        data={{}}
      />
    );

  // For token and proposal spaces, profile will be undefined - this is expected
  if (!profile && !isTokenPage && pageType !== "proposal") {
    console.warn("Profile component is undefined for a non-token, non-proposal space");
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
    providedSpaceId !== undefined && providedSpaceId !== "" &&
    // Avoid showing skeleton for tabs that have already been loaded
    !(loadedTabsRef.current[getCurrentSpaceId() ?? ""] && 
      loadedTabsRef.current[getCurrentSpaceId() ?? ""].has(getCurrentTabName() ?? spaceData.defaultTab));

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
                  hasProfile={
                    !isTokenPage && !!spaceOwnerFid && pageType !== "proposal"
                  }
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