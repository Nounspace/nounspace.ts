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
import { withOptimisticUpdate } from "@/common/utils/tabUtils";
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
    currentSpaceId,
    currentTabName,
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
    renameSpaceTab,
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
    renameSpaceTab: state.space.renameSpaceTab,
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

  // Set the current space and tab name when space data changes
  useEffect(() => {
    const newSpaceId = spacePageData.spaceId ?? null;
    const newTabName = providedTabName || spacePageData.defaultTab;
    
    setCurrentSpaceId(newSpaceId);
    setCurrentTabName(newTabName);
  }, [spacePageData.spaceId, providedTabName, spacePageData.defaultTab, setCurrentSpaceId, setCurrentTabName]);

  // Get the current config using the store's getter
  const getConfig = useCallback(() => {
    return getCurrentSpaceConfig();
  }, [getCurrentSpaceConfig, currentSpaceId, currentTabName]);

  const currentConfig = getConfig();
  
  // Identity states
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
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

  // Load editable spaces when user signs in
  useEffect(() => {
    if (!currentUserFid) return;
    
    loadEditableSpaces().catch(error => {
      console.error("Error loading editable spaces:", error);
    });
  }, [currentUserFid, loadEditableSpaces]);

  // Load space data when IDs are set
  useEffect(() => {
    if (!currentSpaceId || !currentTabName) return;

    const loadSpace = async () => {
      try {
        await loadSpaceTabOrder(currentSpaceId);
        await loadSpaceTab(currentSpaceId, currentTabName);
      } catch (error) {
        console.error("Error loading space:", error);
      }
    };

    loadSpace();
  }, [currentSpaceId, currentTabName, loadSpaceTabOrder, loadSpaceTab]);

  // Use isEditable logic from spaceData
  const isEditable = useMemo(() => {
    const result = spacePageData.isEditable(
      currentUserFid || undefined, 
      wallets.map((w) => ({ address: w.address as Address }))
    );
    
    return result;
  }, [spacePageData, currentUserFid, wallets, isSignedIntoFarcaster]);

  // Config logic:
  // - If we have currentTabName and the tab is loaded in store, use it
  // - If we don't have currentSpaceId (viewing someone else's space), use default config
  // - Otherwise, return undefined to trigger Suspense while loading
  const config = currentTabName && currentConfig?.tabs?.[currentTabName] ? {
    ...currentConfig.tabs[currentTabName],
    isEditable,
  } : !currentSpaceId ? {
    ...spacePageData.config,
    isEditable,
  } : undefined;

  // Register the space if it doesn't exist
  useEffect(() => {
    if (
      isEditable &&
      isNil(currentSpaceId) &&
      !isNil(currentUserFid)
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
        }
      };

      registerSpace();
    }
  }, [
    isEditable,
    currentUserFid,
    currentSpaceId,
    localSpaces,
    spacePageData,
    registerProposalSpace,
    registerSpaceContract,
    registerSpaceFid,
    registerChannelSpace,
    router,
    setCurrentSpaceId,
    setCurrentTabName,
    loadSpaceTabOrder,
    loadEditableSpaces,
    loadSpaceTab,
  ]);

  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfigSaveDetails) => {
      if (isNil(currentSpaceId) || isNil(currentTabName)) {
        throw new Error("Cannot save config until space and tab are initialized");
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
    [currentSpaceId, currentTabName, saveLocalSpaceTab, config?.fidgetInstanceDatums]
  );

  const commitConfig = useCallback(async () => {
    if (isNil(currentSpaceId) || isNil(currentTabName)) return;
    const network = isTokenSpace(spacePageData) ? spacePageData.tokenData?.network : undefined;
    commitSpaceTab(currentSpaceId, currentTabName, network);
  }, [currentSpaceId, currentTabName, spacePageData, commitSpaceTab]);

  const resetConfig = useCallback(async () => {
    if (isNil(currentSpaceId) || isNil(currentTabName)) return;
    
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
  }, [currentSpaceId, currentTabName, spacePageData.config, remoteSpaces, saveLocalSpaceTab]);

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      isTokenPage={isTokenSpace(spacePageData)}
      inHomebase={false}
      currentTab={currentTabName || spacePageData.defaultTab}
      tabList={
        currentSpaceId && localSpaces[currentSpaceId]?.order
          ? localSpaces[currentSpaceId].order
          : [spacePageData.defaultTab]
      }
      defaultTab={spacePageData.defaultTab}
      contractAddress={isTokenSpace(spacePageData) ? spacePageData.contractAddress as Address : undefined}
      updateTabOrder={async (newOrder) => {
        return currentSpaceId
          ? updateSpaceTabOrder(currentSpaceId, newOrder)
          : undefined;
      }}
      inEditMode={editMode}
      deleteTab={async (tabName) => {
        return currentSpaceId
          ? deleteSpaceTab(
            currentSpaceId,
            tabName,
            isTokenSpace(spacePageData) ? spacePageData.tokenData?.network as EtherScanChainName : undefined,
          )
          : undefined;
      }}
      createTab={async (tabName) => {
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
        if (currentSpaceId) {
          const resolvedConfig = await config;
          return renameSpaceTab(
            currentSpaceId,
            oldName,
            newName,
            resolvedConfig,
            isTokenSpace(spacePageData) ? spacePageData.tokenData?.network as EtherScanChainName : undefined,
          );
        }
        return undefined;
      }}
      commitTab={async (tabName) => {
        return currentSpaceId
          ? commitSpaceTab(
              currentSpaceId, 
              tabName, 
              isTokenSpace(spacePageData) ? spacePageData.tokenData?.network : undefined
            )
          : undefined;
      }}
      commitTabOrder={async () => {
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

  return (
    <SpacePage
      config={config}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      tabBar={tabBar}
      profile={headerFidget ?? undefined}
    />
  );
}
