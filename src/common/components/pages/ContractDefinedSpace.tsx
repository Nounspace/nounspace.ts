"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { OwnerType } from "@/common/data/api/etherscan";
import { useAppStore } from "@/common/data/stores/app";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { ClankerProvider, useClanker } from "@/common/providers/Clanker";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import { useWallets } from "@privy-io/react-auth";
import { find, indexOf, isNil, mapValues, toString } from "lodash";
import router from "next/router";
import { Address } from "viem";
import { useSidebarContext } from "../organisms/Sidebar";
import TabBar from "../organisms/TabBar";
import { SpaceConfigSaveDetails } from "../templates/Space";
import { MobileContractDefinedSpace } from "./MobileSpace";
import SpacePage from "./SpacePage";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

interface ContractDefinedSpaceProps {
  spaceId: string | null;
  tabName: string;
  contractAddress: string;
  pinnedCastId?: string;
  ownerId: string | number | null;
  ownerIdType: OwnerType;
}

const DesktopContractDefinedSpace = ({
  spaceId: providedSpaceId,
  tabName: providedTabName,
  pinnedCastId,
  contractAddress: initialContractAddress,
  ownerId,
  ownerIdType,
}: ContractDefinedSpaceProps) => {
  console.log(ownerId);
  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  const { wallets, ready: walletsReady } = useWallets();
  const { clankerData } = useClanker();

  const {
    editableSpaces,
    localSpaces,
    remoteSpaces,
    loadSpaceTab,
    saveLocalSpaceTab,
    commitSpaceTab,
    registerSpace,
    getCurrentSpaceConfig,
    setCurrentSpaceId,
    setCurrentTabName,
    loadSpaceTabOrder,
    updateSpaceTabOrder,
    commitSpaceTabOrder,
    createSpaceTab,
    deleteSpaceTab,
  } = useAppStore((state) => ({
    editableSpaces: state.space.editableSpaces,
    localSpaces: state.space.localSpaces,
    remoteSpaces: state.space.remoteSpaces,
    currentSpaceId: state.currentSpace.currentSpaceId,
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    setCurrentTabName: state.currentSpace.setCurrentTabName,

    // TODO: update these two to work with tabs?
    registerSpace: state.space.registerSpaceContract,
    getCurrentSpaceConfig: state.currentSpace.getCurrentSpaceConfig,

    loadSpaceTab: state.space.loadSpaceTab,
    createSpaceTab: state.space.createSpaceTab,
    deleteSpaceTab: state.space.deleteSpaceTab,
    saveLocalSpaceTab: state.space.saveLocalSpaceTab,
    commitSpaceTab: state.space.commitSpaceTabToDatabase,

    loadSpaceTabOrder: state.space.loadSpaceTabOrder,
    updateSpaceTabOrder: state.space.updateLocalSpaceOrder,
    commitSpaceTabOrder: state.space.commitSpaceOrderToDatabase,
  }));
  const [loading, setLoading] = useState(!isNil(providedSpaceId));
  const [spaceId, setSpaceId] = useState(providedSpaceId);
  const [contractAddress, setContractAddress] = useState(
    initialContractAddress,
  );

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

  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  useEffect(() => {
    authManagerGetInitializedAuthenticators().then((authNames) => {
      setIsSignedIntoFarcaster(
        indexOf(authNames, FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME) > -1,
      );
    });
  }, [authManagerLastUpdatedAt]);

  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);

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
    return (
      (isNil(spaceId) &&
        ((ownerIdType === "fid" &&
          (toString(ownerId) === toString(currentUserFid) ||
            Number(ownerId) === currentUserFid)) ||
          (ownerIdType === "address" &&
            !isNil(find(wallets, (w) => w.address === ownerId))))) ||
      (!isNil(spaceId) && spaceId in editableSpaces)
    );
  }, [
    editableSpaces,
    currentUserFid,
    spaceId,
    ownerId,
    ownerIdType,
    walletsReady,
  ]);

  const [castHash, setCastHash] = useState<string>("");
  const [casterFid, setCasterFid] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");

  useEffect(() => {
    if (clankerData) {
      if (clankerData.cast_hash) setCastHash(clankerData.cast_hash);
      if (clankerData.requestor_fid)
        setCasterFid(String(clankerData.requestor_fid));
      setSymbol(clankerData.symbol);
    }
  }, [clankerData]);

  useEffect(() => {
    const getTokenData = async () => {
      if (clankerData) return;
      try {
        const { tokenSymbol } = await fetchTokenData(contractAddress, null);
        setSymbol(tokenSymbol || "");
      } catch (err) {
        console.error("Error fetching token data:", err);
      }
    };
    getTokenData();
  }, [contractAddress, clankerData]);

  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitialContractSpaceConfigForAddress(
        contractAddress ?? "",
        symbol ?? "",
        castHash ?? "",
        casterFid ?? "",
        symbol ?? "",
        !!clankerData,
      ),
    [contractAddress, symbol, castHash, casterFid, clankerData],
  );

  const currentConfig = getCurrentSpaceConfig();

  const config = {
    ...(currentConfig?.tabs[providedTabName]
      ? currentConfig.tabs[providedTabName]
      : INITIAL_SPACE_CONFIG),
    isEditable,
  };

  const memoizedConfig = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ...restConfig } = config;
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
    if (isEditable && isNil(spaceId) && !isNil(currentUserFid)) {
      registerSpace(contractAddress, "Profile").then((newSpaceId) => {
        if (newSpaceId) {
          setSpaceId(newSpaceId);
          setCurrentSpaceId(newSpaceId);
          setCurrentTabName("Profile");
        }
      });
    }
  }, [isEditable, spaceId, currentUserFid]);

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
    [currentUserFid, spaceId, providedTabName],
  );

  const commitConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    commitSpaceTab(spaceId, providedTabName);
  }, [spaceId, providedTabName]);

  // Resets the configuration of a space tab.
  // If no remote configuration exists, it sets the tab to the initial personal space config.
  // Otherwise, it restores the tab to its last saved remote state.
  const resetConfig = useCallback(async () => {
    if (isNil(spaceId)) return;
    const initialConfig = INITIAL_SPACE_CONFIG;
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
  }, [spaceId, INITIAL_SPACE_CONFIG, remoteSpaces, providedTabName]);

  async function switchTabTo(tabName: string) {
    if (spaceId) {
      const resolvedConfig = await config;
      saveLocalSpaceTab(spaceId, providedTabName, resolvedConfig);
    }
    router.push(`/t/base/${contractAddress}/${tabName}`);
  }

  function getSpacePageUrl(tabName: string) {
    return `/t/base/${contractAddress}/${tabName}`;
  }

  const { editMode } = useSidebarContext();

  const tabBar = (
    <TabBar
      isTokenPage={true}
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
        return spaceId ? deleteSpaceTab(spaceId, tabName) : undefined;
      }}
      createTab={async (tabName) => {
        return spaceId ? createSpaceTab(spaceId, tabName) : undefined;
      }}
      renameTab={async (oldName, newName) => {
        if (spaceId) {
          const resolvedConfig = await config;
          return saveLocalSpaceTab(spaceId, oldName, resolvedConfig, newName);
        }
        return undefined;
      }}
      commitTab={async (tabName) => {
        return spaceId ? commitSpaceTab(spaceId, tabName) : undefined;
      }}
      commitTabOrder={async () => {
        return spaceId ? commitSpaceTabOrder(spaceId) : undefined;
      }}
      getSpacePageUrl={getSpacePageUrl}
    />
  );

  return (
    <SpacePage
      key={spaceId + providedTabName}
      config={memoizedConfig}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      tabBar={tabBar}
      loading={loading}
    />
  );
};

const ContractDefinedSpace = (props: ContractDefinedSpaceProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ClankerProvider contractAddress={props.contractAddress as Address}>
      {isMobile ? (
        <MobileContractDefinedSpace contractAddress={props.contractAddress} />
      ) : (
        <DesktopContractDefinedSpace {...props} />
      )}
    </ClankerProvider>
  );
};

export default ContractDefinedSpace;
