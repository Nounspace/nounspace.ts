"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores/app";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import TabBar from "@/common/components/organisms/TabBar";
import SpacePage from "./SpacePage";
import { SpaceConfigSaveDetails } from "./Space";
import { find, indexOf, isNil, mapValues, noop, toString } from "lodash";
import { useRouter } from "next/navigation";
import { useWallets } from "@privy-io/react-auth";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { MasterToken } from "@/common/providers/TokenProvider";
import Profile from "@/fidgets/ui/profile";
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
}: PublicSpaceProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!isNil(providedSpaceId));
  const [spaceId, setSpaceId] = useState(providedSpaceId);
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { wallets, ready: walletsReady } = useWallets();

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
  }));

  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
  useEffect(() => {
    setCurrentSpaceId(providedSpaceId);
    setCurrentTabName(providedTabName);
    if (!isNil(providedSpaceId)) {
      setLoading(true);
      // First, load the space tab order
      loadSpaceTabOrder(providedSpaceId)
        .then(() => {
          // After loading the tab order, load the specific tab
          return loadSpaceTab(providedSpaceId, providedTabName);
        })
        .then(() => {
          setSpaceId(providedSpaceId);
          setLoading(false);
          // Load remaining tabs after the initial one has finished
          return loadRemainingTabs(providedSpaceId);
        })
        .catch((error) => {
          console.error("Error loading space:", error);
          setLoading(false);
        });
    }
  }, [providedSpaceId, providedTabName]);

  // Function to load remaining tabs
  const loadRemainingTabs = useCallback(
    async (spaceId: string) => {
      const tabOrder = localSpaces[spaceId]?.order || [];
      for (const tabName of tabOrder) {
        if (tabName !== providedTabName) {
          await loadSpaceTab(spaceId, tabName);
        }
      }
    },
    [localSpaces, providedTabName, loadSpaceTab],
  );

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
      }
    });
  }, [isSignedIntoFarcaster, authManagerLastUpdatedAt]);

  const isEditable = useMemo(() => {
    if (!currentUserFid) return false;

    if (isTokenPage) {
      // Contract space editability logic
      return (
        parseInt(toString(tokenData?.clankerData?.requestor_fid) || "") === currentUserFid ||
        (isNil(spaceId) &&
          ((ownerIdType === "fid" &&
            (toString(ownerId) === toString(currentUserFid) ||
              Number(ownerId) === currentUserFid)) ||
            (ownerIdType === "address" &&
              !isNil(find(wallets, (w) => w.address === ownerId))))) ||
        (!isNil(spaceId) && spaceId in editableSpaces)
      );
    } else {
      // User space editability logic
      return (
        (isNil(spaceId) && fid === currentUserFid) ||
        (!isNil(spaceId) && spaceId in editableSpaces)
      );
    }
  }, [
    currentUserFid,
    isTokenPage,
    spaceId,
    editableSpaces,
    ownerId,
    ownerIdType,
    wallets,
    tokenData?.clankerData?.requestor_fid,
    isSignedIntoFarcaster,
    fid
  ]);

  const currentConfig = getCurrentSpaceConfig();
  const config = {
    ...(currentConfig?.tabs[providedTabName]
      ? currentConfig.tabs[providedTabName]
      : initialConfig),
    isEditable,
  };

  // Creates a new "Profile" space for the user when they're eligible to edit but don't have an existing space ID.
  // This ensures that new users or users without a space get a default profile space created for them.
  useEffect(() => {
    if (isEditable && isNil(spaceId) && !isNil(currentUserFid)) {
      const registerSpace = async () => {
        let newSpaceId: string | undefined;
        if (isTokenPage && contractAddress && tokenData?.network) {
          newSpaceId = await registerSpaceContract(
            contractAddress,
            "Profile",
            currentUserFid,
            initialConfig,
            tokenData.network
          );
        } else if (!isTokenPage) {
          newSpaceId = await registerSpaceFid(currentUserFid, "Profile");
        }
        if (newSpaceId) {
          setSpaceId(newSpaceId);
          setCurrentSpaceId(newSpaceId);
          setCurrentTabName("Profile");
        }
      };
      registerSpace();
    }
  }, [isEditable, spaceId, currentUserFid, isTokenPage, contractAddress, tokenData?.network, initialConfig]);


  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfigSaveDetails) => {
      if (isNil(currentUserFid)) {
        throw new Error("Attempted to save config when user is not signed in!");
      }
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
      // Save the configuration locally
      return saveLocalSpaceTab(spaceId, providedTabName, saveableConfig);
    },
    [spaceId, providedTabName],
  );

  const commitConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    commitSpaceTab(spaceId, providedTabName, tokenData?.network);
  }, [spaceId, providedTabName, tokenData?.network]);

  const resetConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    if (isNil(remoteSpaces[spaceId])) {
      saveLocalSpaceTab(spaceId, providedTabName, {
        ...initialConfig,
        isPrivate: false,
      });
    } else {
      saveLocalSpaceTab(
        spaceId,
        providedTabName,
        remoteSpaces[spaceId].tabs[providedTabName],
      );
    }
  }, [spaceId, initialConfig, remoteSpaces, providedTabName]);

  // Common tab management
  async function switchTabTo(tabName: string, shouldSave: boolean = true) {
    if (spaceId && shouldSave) {
      const resolvedConfig = await config;
      await saveLocalSpaceTab(spaceId, providedTabName, resolvedConfig);
    }
    if (tabName) router.push(getSpacePageUrl(tabName));
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      isTokenPage={isTokenPage}
      inHomebase={false}
      currentTab={providedTabName}
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

  const profile = 
    isNil(fid) ? undefined :
    <Profile.fidget
      settings={{ fid }}
      saveData={async () => noop()}
      data={{}}
    />;

  console.log(
    fid,
    isNil(fid),
    profile
  );

  return (
    <SpacePage
      key={spaceId + providedTabName}
      config={config}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      tabBar={tabBar}
      loading={loading}
      profile={profile ?? undefined}
    />
  );
} 