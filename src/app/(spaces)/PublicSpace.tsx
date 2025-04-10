"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores/app";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import TabBar from "@/common/components/organisms/TabBar";
import SpacePage from "./SpacePage";
import { SpaceConfigSaveDetails } from "./Space";
import { find, indexOf, isNil, mapValues, toString } from "lodash";
import { useRouter } from "next/navigation";
import { useWallets } from "@privy-io/react-auth";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { MasterToken } from "@/common/providers/TokenProvider";
import { CompleteFidgets } from "@/fidgets";
const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

interface PublicSpaceProps {
  spaceId: string | null;
  tabName: string;
  initialConfig: any; // Replace with proper type
  getSpacePageUrl: (tabName: string) => string;
  // Token-specific props
  isTokenPage?: boolean;
  contractAddress?: string;
  ownerId?: string;
  ownerIdType?: 'fid' | 'address';
  tokenData?: MasterToken;
  // User-specific props
  fid?: number;
  // Editability prop
  isEditable?: boolean;
}

export default function PublicSpace({
  spaceId: providedSpaceId,
  tabName: providedTabName,
  initialConfig,
  getSpacePageUrl,
  // Token-specific props
  isTokenPage = false,
  contractAddress,
  ownerId,
  ownerIdType,
  tokenData,
  // User-specific props
  fid,
  // Editability prop
  isEditable = false,
}: PublicSpaceProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!isNil(providedSpaceId));
  const [spaceId, setSpaceId] = useState(providedSpaceId);
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { wallets, ready: walletsReady } = useWallets();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Decode the tab name from URL
  const decodedTabName = useMemo(() => {
    if (!providedTabName) return "Profile";
    return decodeURIComponent(providedTabName);
  }, [providedTabName]);

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  const {
    editableSpaces,
    localSpaces,
    remoteSpaces,
    loadSpaceTab,
    saveLocalSpaceTab,
    commitSpaceTab,
    getCurrentSpaceConfig,
    setCurrentSpaceId,
    setCurrentTabName,
    loadSpaceTabOrder,
    updateSpaceTabOrder,
    commitSpaceTabOrder,
    createSpaceTab,
    deleteSpaceTab,
    registerSpaceFid,
    registerSpaceContract,
    loadEditableSpaces,
  } = useAppStore((state) => ({
    editableSpaces: state.space.editableSpaces,
    localSpaces: state.space.localSpaces,
    remoteSpaces: state.space.remoteSpaces,
    currentSpaceId: state.currentSpace.currentSpaceId,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    setCurrentTabName: state.currentSpace.setCurrentTabName,
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
    loadEditableSpaces: state.space.loadEditableSpaces,
  }));

  // Common Farcaster auth logic
  useEffect(() => {
    authManagerGetInitializedAuthenticators().then((authNames) => {
      setIsSignedIntoFarcaster(
        indexOf(authNames, FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME) > -1,
      );
    });
  }, [authManagerLastUpdatedAt]);

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
        // Load editable spaces after we have the FID
        loadEditableSpaces();
      }
    });
  }, [isSignedIntoFarcaster, authManagerLastUpdatedAt]);

  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
  useEffect(() => {
    setCurrentSpaceId(spaceId);
    setCurrentTabName(decodedTabName);
    if (!isNil(spaceId)) {
      setLoading(true);
      // Load the space tab order
      loadSpaceTabOrder(spaceId)
        .then(() => {
          // Load the specific tab
          return loadSpaceTab(spaceId, decodedTabName);
        })
        .then(() => {
          setLoading(false);
          // Load remaining tabs after the initial one has finished
          return loadRemainingTabs(spaceId);
        })
        .catch((error) => {
          console.error("Error loading space:", error);
          setLoading(false);
        });
    }
  }, [spaceId, decodedTabName]);

  // Function to load remaining tabs
  const loadRemainingTabs = useCallback(
    async (spaceId: string) => {
      // console.log('PublicSpace: Loading remaining tabs', {
      //   spaceId,
      //   tabOrder: localSpaces[spaceId]?.order,
      //   currentTab: decodedTabName
      // });
      
      const tabOrder = localSpaces[spaceId]?.order || [];
      for (const tabName of tabOrder) {
        if (tabName !== decodedTabName) {
          await loadSpaceTab(spaceId, tabName);
        }
      }
    },
    [localSpaces, decodedTabName, loadSpaceTab],
  );

  const currentConfig = getCurrentSpaceConfig();
  // console.log('PublicSpace: Current config', {
  //   spaceId,
  //   tabName: decodedTabName,
  //   hasConfig: !!currentConfig,
  //   configTabs: currentConfig?.tabs ? Object.keys(currentConfig.tabs) : [],
  //   isEditable
  // });

  const config = {
    ...(currentConfig?.tabs[decodedTabName]
      ? currentConfig.tabs[decodedTabName]
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

  // Creates a new "Profile" space for the user when they're eligible to edit but don't have an existing space ID.
  // This ensures that new users or users without a space get a default profile space created for them.
  useEffect(() => {
    // Only proceed with registration if we're sure the space doesn't exist and we're not already registering
    if (isEditable && isNil(spaceId) && !isNil(currentUserFid) && !loading && !isRegistering) {
      console.log('Space registration conditions met:', {
        isEditable,
        spaceId,
        currentUserFid,
        isTokenPage,
        contractAddress,
        tokenNetwork: tokenData?.network,
        isRegistering
      });

      setIsRegistering(true);

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
            // Wait for the space to be properly registered before updating state
            await loadEditableSpaces();
            setSpaceId(newSpaceId);
            setCurrentSpaceId(newSpaceId);
            setCurrentTabName("Profile");
          }
        } catch (error) {
          console.error('Error during space registration:', error);
        } finally {
          setIsRegistering(false);
        }
      };

      registerSpace();
    }
  }, [spaceId, currentUserFid, loading, contractAddress, tokenData?.network, isEditable, isTokenPage]);

  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfigSaveDetails) => {
      if (isNil(spaceId)) {
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
      return saveLocalSpaceTab(spaceId, decodedTabName, saveableConfig);
    },
    [spaceId, decodedTabName],
  );

  const commitConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    commitSpaceTab(spaceId, decodedTabName, tokenData?.network);
  }, [spaceId, decodedTabName, tokenData?.network]);

  const resetConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    if (isNil(remoteSpaces[spaceId])) {
      saveLocalSpaceTab(spaceId, decodedTabName, {
        ...initialConfig,
        isPrivate: false,
      });
    } else {
      saveLocalSpaceTab(
        spaceId,
        decodedTabName,
        remoteSpaces[spaceId].tabs[decodedTabName],
      );
    }
  }, [spaceId, initialConfig, remoteSpaces, decodedTabName]);

  // Common tab management
  async function switchTabTo(tabName: string, shouldSave: boolean = true) {
    if (spaceId && shouldSave) {
      const resolvedConfig = await config;
      await saveLocalSpaceTab(spaceId, decodedTabName, resolvedConfig);
    }
    if (tabName) router.push(getSpacePageUrl(tabName));
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      isTokenPage={isTokenPage}
      inHomebase={false}
      currentTab={decodedTabName}
      tabList={spaceId ? localSpaces[spaceId]?.order : ["Profile"]}
      contractAddress={contractAddress as Address}
      switchTabTo={switchTabTo}
      updateTabOrder={async (newOrder) => {
        return spaceId ? updateSpaceTabOrder(spaceId, newOrder) : undefined;
      }}
      inEditMode={editMode}
      deleteTab={async (tabName) => {
        return spaceId
          ? deleteSpaceTab(spaceId, tabName, tokenData?.network as EtherScanChainName)
          : undefined;
      }}
      createTab={async (tabName) => {
        return spaceId
          ? createSpaceTab(spaceId, tabName, undefined, tokenData?.network)
          : undefined;
      }}
      renameTab={async (oldName, newName) => {
        if (spaceId) {
          const resolvedConfig = await config;
          return saveLocalSpaceTab(spaceId, oldName, resolvedConfig, newName);
        }
        return undefined;
      }}
      commitTab={async (tabName) => {
        return spaceId
          ? commitSpaceTab(spaceId, tabName, tokenData?.network)
          : undefined;
      }}
      commitTabOrder={async () => {
        return spaceId ? commitSpaceTabOrder(spaceId, tokenData?.network as EtherScanChainName) : undefined;
      }}
      getSpacePageUrl={getSpacePageUrl}
    />
  );

  const profile = useMemo(() => {
    if (!isTokenPage && fid && CompleteFidgets.profile) {
      return (
        <CompleteFidgets.profile.fidget
          settings={{ fid }}
          saveData={async () => {}}
          data={{}}
        />
      );
    }
    return undefined;
  }, [isTokenPage, fid]);

  return (
    <SpacePage
      key={spaceId + providedTabName}
      config={memoizedConfig}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      tabBar={tabBar}
      profile={profile ?? undefined}
    />
  );
} 