"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores/app";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import TabBar from "@/common/components/organisms/TabBar";
import SpacePage from "./SpacePage";
import { SpaceConfigSaveDetails } from "./Space";
import { indexOf, isNil, mapValues, noop } from "lodash";
import { useRouter } from "next/navigation";
import { useWallets } from "@privy-io/react-auth";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { MasterToken } from "@/common/providers/TokenProvider";
import Profile from "@/fidgets/ui/profile";
import { createEditabilityChecker } from '@/common/utils/spaceEditability';
const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

interface PublicSpaceProps {
  spaceId: string | null;
  tabName: string;
  initialConfig: any; // Replace with proper type
  getSpacePageUrl: (tabName: string) => string;
  // Token-specific props
  isTokenPage?: boolean;
  contractAddress?: string;
  // Ownership props
  spaceOwnerFid?: number;
  spaceOwnerAddress?: Address;
  // Token data
  tokenData?: MasterToken;
}

export default function PublicSpace({
  spaceId: providedSpaceId,
  tabName: providedTabName,
  initialConfig,
  getSpacePageUrl,
  // Ownership props
  spaceOwnerFid,
  spaceOwnerAddress,
  // Token-specific props
  isTokenPage = false,
  contractAddress,
  tokenData,
}: PublicSpaceProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!isNil(providedSpaceId));
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { wallets } = useWallets();
  
  const {
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
  } = useAppStore((state) => ({
    getCurrentSpaceId: state.currentSpace.getCurrentSpaceId,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    getCurrentTabName: state.currentSpace.getCurrentTabName,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
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
  }));

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  // Create an editability checker
  const editabilityCheck = useMemo(() => {
    return createEditabilityChecker({
      currentUserFid,
      spaceOwnerFid,
      spaceOwnerAddress,
      tokenData,
      wallets: wallets.map(w => ({ address: w.address as Address })),
      isTokenPage,
    });
  }, [currentUserFid, spaceOwnerFid, spaceOwnerAddress, tokenData, wallets, isTokenPage]);

  // Internal isEditable function
  const isEditable = useCallback((userFid: number) => {
    return editabilityCheck.isEditable;
  }, [editabilityCheck]);

  // Sets the current space and tab name on initial load
  useEffect(() => {
    setCurrentSpaceId(providedSpaceId);
    setCurrentTabName(decodeURIComponent(providedTabName));
  }, [providedSpaceId, providedTabName]);

  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName();
    if (!isNil(currentSpaceId)) {
      setLoading(true);
      // First, load the space tab order
      loadSpaceTabOrder(currentSpaceId)
        .then(() => {
          loadEditableSpaces();
        })
        .then(() => {
          // Load the specific tab
          return loadSpaceTab(currentSpaceId, currentTabName ?? "Profile");
        })
        .then(() => {
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading space:", error);
          setLoading(false);
        });
    }
  }, [getCurrentSpaceId, getCurrentTabName]);

  // Function to load remaining tabs
  const loadRemainingTabs = useCallback(
    async (spaceId: string) => {
      const currentTabName = getCurrentTabName();
      const tabOrder = localSpaces[spaceId]?.order || [];
      for (const tabName of tabOrder) {
        if (tabName !== currentTabName) {
          await loadSpaceTab(spaceId, tabName);
        }
      }
    },
    [localSpaces, getCurrentTabName, loadSpaceTab],
  );

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
  // console.log('PublicSpace: Current config', {
  //   spaceId,
  //   tabName: decodedTabName,
  //   hasConfig: !!currentConfig,
  //   configTabs: currentConfig?.tabs ? Object.keys(currentConfig.tabs) : [],
  //   isEditable
  // });

  const config = {
    ...(currentConfig?.tabs[getCurrentTabName() ?? "Profile"]
      ? currentConfig.tabs[getCurrentTabName() ?? "Profile"]
      : { ...initialConfig }),
    isEditable,
  };

  const memoizedConfig = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timestamp, ...restConfig } = config;
    return restConfig;
  }, [
    config.fidgetInstanceDatums,
    config.layoutID,
    config.layoutDetails,
    config.isEditable,
    config.fidgetTrayContents,
    config.theme,
  ]);

  // Update the space registration effect to use the new editability check
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    console.log('Space registration check:', {
      isEditable: editabilityCheck.isEditable,
      isLoading: editabilityCheck.isLoading,
      spaceId: currentSpaceId,
      currentUserFid,
      loading,
      isTokenPage,
      contractAddress,
      tokenNetwork: tokenData?.network
    });

    // Only proceed with registration if we're sure the space doesn't exist and FID is linked
    if (editabilityCheck.isEditable && 
      isNil(currentSpaceId) && 
      !isNil(currentUserFid) && 
      !loading && 
      !editabilityCheck.isLoading) {
      console.log('Space registration conditions met:', {
        isEditable: editabilityCheck.isEditable,
        spaceId: currentSpaceId,
        currentUserFid,
        isTokenPage,
        contractAddress,
        tokenNetwork: tokenData?.network,
      });

      const registerSpace = async () => {
        try {
          let newSpaceId: string | undefined;
          
          if (isTokenPage && contractAddress && tokenData?.network) {
            console.log('Attempting to register contract space:', {
              contractAddress,
              currentUserFid,
              network: tokenData.network
            });
            newSpaceId = await registerSpaceContract(
              contractAddress,
              "Profile",
              currentUserFid,
              initialConfig,
              tokenData.network
            );
            console.log('Contract space registration result:', {
              success: !!newSpaceId,
              newSpaceId,
              contractAddress
            });
            if (newSpaceId) {
              router.refresh(); // Refresh the page to get the new space ID
            }
          } else if (!isTokenPage) {
            console.log('Attempting to register user space:', {
              currentUserFid
            });
            newSpaceId = await registerSpaceFid(currentUserFid, "Profile");
            console.log('User space registration result:', {
              success: !!newSpaceId,
              newSpaceId,
              currentUserFid
            });
          }

          if (newSpaceId) {
            // Set both spaceId and currentSpaceId atomically
            setCurrentSpaceId(newSpaceId);
            setCurrentTabName("Profile");
            
            // Load the space data after registration
            await loadSpaceTabOrder(newSpaceId);
            await loadEditableSpaces();
            await loadSpaceTab(newSpaceId, "Profile");
            
            // Load remaining tabs
            const tabOrder = localSpaces[newSpaceId]?.order || [];
            for (const tabName of tabOrder) {
              if (tabName !== "Profile") {
                await loadSpaceTab(newSpaceId, tabName);
              }
            }
          }
        } catch (error) {
          console.error('Error during space registration:', error);
        }
      };

      registerSpace();
    }
  }, [
    editabilityCheck.isEditable, 
    editabilityCheck.isLoading, 
    currentUserFid, 
    loading, 
    isTokenPage, 
    contractAddress, 
    tokenData?.network,
    getCurrentSpaceId,
    getCurrentTabName,
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
        fidgetInstanceDatums: mapValues(
          spaceConfig.fidgetInstanceDatums,
          (datum) => ({
            ...datum,
            config: {
              settings: datum.config.settings,
              editable: datum.config.editable,
            },
          }),
        ),
        isPrivate: false,
      };
      return saveLocalSpaceTab(currentSpaceId, currentTabName, saveableConfig);
    },
    [getCurrentSpaceId, getCurrentTabName],
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
    if (isNil(remoteSpaces[currentSpaceId])) {
      saveLocalSpaceTab(currentSpaceId, currentTabName, {
        ...initialConfig,
        isPrivate: false,
      });
    } else {
      saveLocalSpaceTab(
        currentSpaceId,
        currentTabName,
        remoteSpaces[currentSpaceId].tabs[currentTabName],
      );
    }
  }, [getCurrentSpaceId, initialConfig, remoteSpaces, getCurrentTabName]);
        
  // Common tab management
  async function switchTabTo(tabName: string, shouldSave: boolean = true) {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";
    if (currentSpaceId && shouldSave) {
      const resolvedConfig = await config;
      await saveLocalSpaceTab(currentSpaceId, currentTabName, resolvedConfig);
    }
    // Update the URL without triggering a full navigation
    router.replace(getSpacePageUrl(tabName), { scroll: false });
    // Update the current tab name in the store
    setCurrentTabName(tabName);
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      isTokenPage={isTokenPage}
      inHomebase={false}
      currentTab={getCurrentTabName() ?? "Profile"}
      tabList={getCurrentSpaceId() ? localSpaces[getCurrentSpaceId()!]?.order : ["Profile"]}
      contractAddress={contractAddress as Address}
      switchTabTo={switchTabTo}
      updateTabOrder={async (newOrder) => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId ? updateSpaceTabOrder(currentSpaceId, newOrder) : undefined;
      }}
      inEditMode={editMode}
      deleteTab={async (tabName) => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId
          ? deleteSpaceTab(currentSpaceId, tabName, tokenData?.network as EtherScanChainName)
          : undefined;
      }}
      createTab={async (tabName) => {
        const currentSpaceId = getCurrentSpaceId();
        return currentSpaceId
          ? createSpaceTab(currentSpaceId, tabName, undefined, tokenData?.network as EtherScanChainName)
          : undefined;
      }}
      renameTab={async (oldName, newName) => {
        const currentSpaceId = getCurrentSpaceId();
        if (currentSpaceId) {
          const resolvedConfig = await config;
          return saveLocalSpaceTab(currentSpaceId, oldName, resolvedConfig, newName);
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
          ? commitSpaceTabOrder(currentSpaceId, tokenData?.network as EtherScanChainName) 
          : undefined;
      }}
      getSpacePageUrl={getSpacePageUrl}
    />
  );

  const profile = (
    isTokenPage || !spaceOwnerFid ? undefined :
    <Profile.fidget
      settings={{ fid: spaceOwnerFid }}
      saveData={async () => noop()}
      data={{}}
    />);

  return (
    <SpacePage
      key={getCurrentSpaceId() + providedTabName}
      config={memoizedConfig}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      tabBar={tabBar}
      profile={profile ?? undefined}
    />
  );
} 