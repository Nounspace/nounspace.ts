"use client";

import React, { Suspense } from "react";
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

  // Remove manual loading state - we'll use Suspense instead
  console.log("🔍 [3/7] PublicSpace - Space data received:", {
    spaceDataId: spaceData.id,
    isSpaceDataIdNil: isNil(spaceData.id),
    hasLocalSpace: spaceData.id ? !!localSpaces[spaceData.id] : false
  });
  const [currentUserFid, setCurrentUserFid] = useState<number | undefined>(undefined);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { wallets } = useWallets();
  
  // Clear cache when switching to a different space
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    if (currentSpaceId !== spaceData.id) {
      clearLocalSpaces();
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
    // Space switching logic - simplified without loading state management
    
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

  // Simplified tab loading - let Suspense handle the loading states
  const _loadRemainingTabs = useCallback(
    async (spaceId: string) => {
      const currentTabName = getCurrentTabName() ?? "Profile";
      const tabOrder = localSpaces[spaceId]?.order || [];
      
      // Load remaining tabs in parallel
      const tabsToLoad = tabOrder.filter((tabName) => tabName !== currentTabName);
      
      if (tabsToLoad.length > 0) {
        await Promise.all(
          tabsToLoad.map(async (tabName) => {
            await loadSpaceTab(spaceId, tabName, currentUserFid || undefined);
          })
        );
      }
    },
    [localSpaces, getCurrentTabName, loadSpaceTab, currentUserFid],
  );

  // Simplified: For unregistered spaces (spaceData.id is undefined), we don't need to load anything
  // For registered spaces, we'll let Suspense handle the loading
  const currentSpaceId = getCurrentSpaceId();
  
  // Only load space data if we have a spaceId and it's not already loaded
  useEffect(() => {
    if (currentSpaceId && !localSpaces[currentSpaceId]) {
      // Load space data asynchronously - Suspense will handle the loading state
      loadSpaceTabOrder(currentSpaceId)
        .then(() => loadEditableSpaces())
        .then(() => loadSpaceTab(currentSpaceId, getCurrentTabName() ?? "Profile", currentUserFid || undefined))
        .catch((error) => {
          console.error("Error loading space:", error);
        });
    }
  }, [
    currentSpaceId, 
    localSpaces, 
    loadSpaceTabOrder, 
    loadEditableSpaces, 
    loadSpaceTab, 
    getCurrentTabName, 
    currentUserFid
  ]);

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

  console.log("🔍 [3/7] PublicSpace - Config resolution (currentConfig vs spaceData.config):", {
    currentSpaceId: getCurrentSpaceId(),
    currentTabName: getCurrentTabName(),
    currentConfig,
    spaceData,
    isEditable
  });

  const config = {
    ...(currentConfig?.tabs[getCurrentTabName() ?? "Profile"]
      ? currentConfig.tabs[getCurrentTabName() ?? "Profile"]
      : { ...spaceData.config }),
    isEditable,
  };

  console.log("🔍 [4/7] PublicSpace - Final config before memoization (merged currentConfig + spaceData.config):", config);

  const memoizedConfig = useMemo(() => {
    if (!config) {
      console.error("Config is undefined - this should not happen as spaceData.config should always be defined");
      // Add isEditable property to INITIAL_SPACE_CONFIG_EMPTY
      return {
        ...INITIAL_SPACE_CONFIG_EMPTY,
        isEditable
      };
    }
    
    console.log("🔍 [5/7] PublicSpace - Memoized config (final config passed to SpacePage):", config);
    
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
      !isNil(currentUserFid)
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
      // Load the tab from the database - Suspense will handle loading state
      loadSpaceTab(currentSpaceId, tabName, currentUserFid || undefined)
        .catch(error => console.error(`Error loading tab ${tabName}:`, error));
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

  const tabList = getCurrentSpaceId()
    ? localSpaces[getCurrentSpaceId()!]?.order
    : config.tabNames || ["Profile"];

  console.log("🔍 [3/7] PublicSpace - Tab list for TabBar:", {
    currentSpaceId: getCurrentSpaceId(),
    hasLocalSpace: getCurrentSpaceId() ? !!localSpaces[getCurrentSpaceId()!] : false,
    localSpaceOrder: getCurrentSpaceId() ? localSpaces[getCurrentSpaceId()!]?.order : null,
    configTabNames: config.tabNames,
    finalTabList: tabList
  });

  const tabBar = (
    <TabBar
      isTokenPage={isTokenSpace(spaceData)}
      pageType={spaceData.spaceType}
      inHomebase={false}
      currentTab={getCurrentTabName() ?? "Profile"}
      tabList={tabList}
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
  
  console.log("🔍 [3/7] PublicSpace - Rendering with Suspense");
  
  return (
    <Suspense fallback={
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
    }>
      {MemoizedSpacePage}
    </Suspense>
  );
}