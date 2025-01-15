// only clankertokens v2 have castHash and casterFid

"use client";
import { find, indexOf, isNil, mapValues, toString } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores/app";
import { SpaceConfig, SpaceConfigSaveDetails } from "../templates/Space";
import SpacePage from "./SpacePage";
import router from "next/router";
import { useSidebarContext } from "../organisms/Sidebar";
import { useWallets } from "@privy-io/react-auth";
import { OwnerType } from "@/common/data/api/etherscan";
import { Address } from "viem";
import TabBar from "../organisms/TabBar";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import { useReadContract } from "wagmi";
import { FaExchangeAlt, FaStream } from "react-icons/fa";
import { MobileContractDefinedSpace } from "./MobileSpace";
import contract, { BasescanResult } from "@/pages/api/basescan/contract";
import { ClankerAbiV2 } from "@/common/lib/utils/TokensAbi";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

interface ContractDefinedSpaceProps {
  spaceId: string | null;
  tabName: string;
  contractAddress: string;
  pinnedCastId?: string;
  ownerId: string | number | null;
  ownerIdType: OwnerType;
  isClankerToken: boolean;
}

function createDefaultLayout(
  contractAddr: string,
  pinnedCastId: string,
  tokenSymbol: string,
  castHash: string,
  casterFid: string,
  symbol: string,
): Promise<Omit<SpaceConfig, "isEditable">> {
  return createInitialContractSpaceConfigForAddress(
    contractAddr,
    tokenSymbol,
    castHash,
    casterFid,
    symbol,
  );
}

const DesktopContractDefinedSpace = ({
  spaceId: providedSpaceId,
  tabName: providedTabName,
  pinnedCastId,
  contractAddress: initialContractAddress,
  ownerId,
  ownerIdType,
  isClankerToken,
}: ContractDefinedSpaceProps) => {
  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();
  const { wallets, ready: walletsReady } = useWallets();
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
          toString(ownerId) === toString(currentUserFid)) ||
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
    if (isClankerToken) {
      const { data: rawCastHash, error: castHashError } = useReadContract({
        address: contractAddress as Address,
        abi: ClankerAbiV2,
        functionName: "castHash",
      });
      console.log("Raw Cast Hash:", rawCastHash);
      const { data: rawFid, error: fidError } = useReadContract({
        address: contractAddress as Address,
        abi: ClankerAbiV2,
        functionName: "fid",
      });
      console.log("Raw Fid:", rawFid);
      const { data: rawSymbol, error: symbolError } = useReadContract({
        address: contractAddress as Address,
        abi: ClankerAbiV2,
        functionName: "symbol",
      });

      if (castHashError) {
        console.error("Error fetching castHash:", castHashError);
      }
      if (fidError) {
        console.error("Error fetching fid:", fidError);
      }
      if (symbolError) {
        console.error("Error fetching symbol:", symbolError);
      }

      setCastHash(rawCastHash?.toString() || "");
      setCasterFid(rawFid?.toString() || "");
      setSymbol(rawSymbol?.toString() || "");

      console.log("Cast Hash:", castHash);
      console.log("Caster Fid:", casterFid);
      console.log("Symbol:", symbol);
    }
  }, [isClankerToken, contractAddress]);

  const INITIAL_TOKEN_SPACE_CONFIG = useMemo(
    () =>
      createDefaultLayout(
        contractAddress ?? "",
        pinnedCastId ?? "",
        "",
        castHash,
        casterFid,
        symbol,
      ),
    [contractAddress, pinnedCastId, castHash, casterFid, symbol],
  );

  const currentConfig = getCurrentSpaceConfig();

  const config = useMemo(() => {
    const fetchConfig = async () => {
      const initialConfig = await INITIAL_TOKEN_SPACE_CONFIG;
      return {
        ...(currentConfig?.tabs?.[providedTabName] || initialConfig),
        isEditable,
      };
    };
    return fetchConfig();
  }, [currentConfig, providedTabName, INITIAL_TOKEN_SPACE_CONFIG, isEditable]);

  const memoizedConfig = useMemo(() => {
    const resolveConfig = async () => {
      const resolvedConfig = await config;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { timestamp, ...restConfig } = resolvedConfig;
      return restConfig;
    };
    return resolveConfig();
  }, [config]);

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
    const initialConfig = await INITIAL_TOKEN_SPACE_CONFIG;
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
  }, [spaceId, INITIAL_TOKEN_SPACE_CONFIG, remoteSpaces, providedTabName]);

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
      isClankerToken={isClankerToken}
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

  const [resolvedConfig, setResolvedConfig] = useState<SpaceConfig | undefined>(
    undefined,
  );

  useEffect(() => {
    memoizedConfig.then(setResolvedConfig).catch((error) => {
      console.error("Error resolving config:", error);
    });
  }, [memoizedConfig]);

  useEffect(() => {
    if (!resolvedConfig) {
      console.warn("Resolved Config is not ready, falling back to default.");
      INITIAL_TOKEN_SPACE_CONFIG.then((config) => {
        setResolvedConfig({ ...config, isEditable: false });
      });
    }
  }, [resolvedConfig, INITIAL_TOKEN_SPACE_CONFIG]);

  return (
    <SpacePage
      key={spaceId + providedTabName}
      config={resolvedConfig ?? undefined}
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
  const [isClankerToken, setIsClankerToken] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const contract = await fetch(
        `/api/basescan/contract?contractAddress=${props.contractAddress}`,
      );
      const contractData: BasescanResult = await contract.json();
      const factoryAddress = contractData.contractFactory?.toLocaleLowerCase();
      if (factoryAddress) {
        if (factoryAddress === "0x250c9fb2b411b48273f69879007803790a6aea47") {
          console.log("Clanker Token Detected: v0");
        } else if (
          factoryAddress === "0x9b84fce5dcd9a38d2d01d5d72373f6b6b067c3e1"
        ) {
          console.log("Clanker Token Detected: v1");
        } else if (
          factoryAddress === "0x732560fa1d1a76350b1a500155ba978031b53833"
        ) {
          console.log("Clanker Token Detected: v2");
          setIsClankerToken(true);
        }
        console.log("Factory Address:", factoryAddress);
      }
    };
    fetchData();
  }, [contract]);
  console.log("IsClankerToken:", isClankerToken);

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

  return isMobile ? (
    <MobileContractDefinedSpace
      contractAddress={props.contractAddress}
      isClankerToken={isClankerToken}
    />
  ) : (
    <DesktopContractDefinedSpace {...props} isClankerToken={isClankerToken} />
  );
};

export default ContractDefinedSpace;
