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
import { useCallback, useEffect, useMemo, useState } from "react";
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
    getCurrentSpaceId,
    setCurrentSpaceId,
    getCurrentTabName,
    setCurrentTabName,
    getCurrentSpaceConfig,
    localSpaces,
    remoteSpaces,
    loadSpaceTab,
    saveLocalSpaceTab,
    commitSpaceTab,
    updateSpaceTabOrder,
    commitSpaceTabOrder,
    createSpaceTab,
    deleteSpaceTab,
    registerSpaceFid,
    registerSpaceContract,
    registerProposalSpace,
    getIsAccountReady,
  } = useAppStore((state) => ({
    getCurrentSpaceId: state.currentSpace.getCurrentSpaceId,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    getCurrentTabName: state.currentSpace.getCurrentTabName,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
    getCurrentSpaceConfig: state.currentSpace.getCurrentSpaceConfig,
    localSpaces: state.space.localSpaces,
    remoteSpaces: state.space.remoteSpaces,
    loadSpaceTab: state.space.loadSpaceTab,
    createSpaceTab: state.space.createSpaceTab,
    deleteSpaceTab: state.space.deleteSpaceTab,
    saveLocalSpaceTab: state.space.saveLocalSpaceTab,
    commitSpaceTab: state.space.commitSpaceTabToDatabase,
    updateSpaceTabOrder: state.space.updateLocalSpaceOrder,
    commitSpaceTabOrder: state.space.commitSpaceOrderToDatabase,
    registerSpaceFid: state.space.registerSpaceFid,
    registerSpaceContract: state.space.registerSpaceContract,
    registerProposalSpace: state.space.registerProposalSpace,
    getIsAccountReady: state.getIsAccountReady,
  }));

  const router = useRouter();

  const [currentUserFid, setCurrentUserFid] = useState<number | undefined>(undefined);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { wallets } = useWallets();

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

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

  // Use isEditable logic from spaceData
  const isEditable = useMemo(() => {
    return spaceData.isEditable(currentUserFid, wallets.map((w) => ({ address: w.address as Address })));
  }, [spaceData, currentUserFid, wallets]);

  // Check if user is authenticated
  const isAuthenticated = getIsAccountReady();

  // Set current space and tab when spaceData has an ID (registered space)
  useEffect(() => {
    if (spaceData.id) {
      setCurrentSpaceId(spaceData.id);
      setCurrentTabName(tabName);
    }
  }, [spaceData.id, tabName, setCurrentSpaceId, setCurrentTabName]);

  // Register space when user is authenticated and space is editable but not registered
  useEffect(() => {
    if (!isAuthenticated || !isEditable || spaceData.id) {
      return; // Don't register if not authenticated, not editable, or already registered
    }

    const registerSpace = async () => {
      try {
        let spaceId: string | undefined;

        if (isProfileSpace(spaceData)) {
          // Register profile space
          spaceId = await registerSpaceFid(
            spaceData.fid,
            spaceData.spaceName,
            `/s/${spaceData.spaceName}`
          );
        } else if (isTokenSpace(spaceData)) {
          // Register token space
          spaceId = await registerSpaceContract(
            spaceData.contractAddress,
            spaceData.spaceName,
            spaceData.tokenData?.clankerData?.requestor_fid || 0,
            spaceData.config,
            spaceData.network as EtherScanChainName
          );
        } else if (isProposalSpace(spaceData)) {
          // Register proposal space
          spaceId = await registerProposalSpace(
            spaceData.proposalId,
            spaceData.config
          );
        }

        // Set current space and tab after successful registration
        if (spaceId) {
          setCurrentSpaceId(spaceId);
          setCurrentTabName(tabName);
        }
      } catch (error) {
        console.error("Error registering space:", error);
      }
    };

    registerSpace();
  }, [
    isAuthenticated, 
    isEditable, 
    spaceData, 
    tabName, 
    setCurrentSpaceId, 
    setCurrentTabName, 
    registerSpaceFid, 
    registerSpaceContract, 
    registerProposalSpace
  ]);

  // Simple config resolution
  const currentConfig = getCurrentSpaceConfig();
  const config = {
    ...(currentConfig?.tabs[getCurrentTabName() ?? "Profile"]
      ? currentConfig.tabs[getCurrentTabName() ?? "Profile"]
      : { ...spaceData.config }),
    isEditable,
  };


  // Memoized config to prevent unnecessary re-renders
  const memoizedConfig = useMemo(() => {
    if (!config) {
      console.error("Config is undefined");
      return { ...spaceData.config, isEditable }; // Fallback to spaceData config with isEditable
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
    [getCurrentSpaceId, getCurrentTabName, saveLocalSpaceTab]
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