"use client";

import { cloneDeep, find, indexOf, isNil, mapValues, toString } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useAppStore } from "@/common/data/stores/app";
import { SpaceConfig, SpaceConfigSaveDetails } from "../templates/Space";
import SpacePage from "./SpacePage";
import router from "next/router";
import { useSidebarContext } from "../organisms/Sidebar";
import { useWallets } from "@privy-io/react-auth";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import { OwnerType } from "@/common/data/api/etherscan";
import { Address } from "viem";
import TabBar from "../organisms/TabBar";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import { useReadContract } from "wagmi";

// TODO: send to utils
interface ContractAbi {
  type: string;
  name?: string;
  inputs?: Array<{
    name: string;
    type: string;
    indexed?: boolean;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
  }>;
  stateMutability?: string;
  constant?: boolean;
  payable?: boolean;
}

export const clankerTokenAbi: ContractAbi[] = [
  {
    type: "constructor",
    inputs: [
      { name: "name_", type: "string" },
      { name: "symbol_", type: "string" },
      { name: "maxSupply_", type: "uint256" },
      { name: "deployer_", type: "address" },
      { name: "fid_", type: "uint256" },
      { name: "image_", type: "string" },
      { name: "castHash_", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  { type: "error", name: "CheckpointUnorderedInsertion" },
  { type: "error", name: "ECDSAInvalidSignature" },
  {
    type: "error",
    name: "ECDSAInvalidSignatureLength",
    inputs: [{ name: "length", type: "uint256" }],
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureS",
    inputs: [{ name: "s", type: "bytes32" }],
  },
  {
    type: "error",
    name: "ERC20ExceededSafeSupply",
    inputs: [
      { name: "increasedSupply", type: "uint256" },
      { name: "cap", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC20InsufficientAllowance",
    inputs: [
      { name: "spender", type: "address" },
      { name: "allowance", type: "uint256" },
      { name: "needed", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC20InsufficientBalance",
    inputs: [
      { name: "sender", type: "address" },
      { name: "balance", type: "uint256" },
      { name: "needed", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC20InvalidApprover",
    inputs: [{ name: "approver", type: "address" }],
  },
  {
    type: "error",
    name: "ERC20InvalidReceiver",
    inputs: [{ name: "receiver", type: "address" }],
  },
  {
    type: "error",
    name: "ERC20InvalidSender",
    inputs: [{ name: "sender", type: "address" }],
  },
  {
    type: "error",
    name: "ERC20InvalidSpender",
    inputs: [{ name: "spender", type: "address" }],
  },
  {
    type: "error",
    name: "ERC2612ExpiredSignature",
    inputs: [{ name: "deadline", type: "uint256" }],
  },
  {
    type: "error",
    name: "ERC2612InvalidSigner",
    inputs: [
      { name: "signer", type: "address" },
      { name: "owner", type: "address" },
    ],
  },
  {
    type: "error",
    name: "ERC5805FutureLookup",
    inputs: [
      { name: "timepoint", type: "uint256" },
      { name: "clock", type: "uint48" },
    ],
  },
  { type: "error", name: "ERC6372InconsistentClock" },
  {
    type: "error",
    name: "InvalidAccountNonce",
    inputs: [
      { name: "account", type: "address" },
      { name: "currentNonce", type: "uint256" },
    ],
  },
  { type: "error", name: "InvalidShortString" },
  { type: "error", name: "NotDeployer" },
  {
    type: "error",
    name: "SafeCastOverflowedUintDowncast",
    inputs: [
      { name: "bits", type: "uint8" },
      { name: "value", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "StringTooLong",
    inputs: [{ name: "str", type: "string" }],
  },
  {
    type: "error",
    name: "VotesExpiredSignature",
    inputs: [{ name: "expiry", type: "uint256" }],
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "DelegateChanged",
    inputs: [
      { indexed: true, name: "delegator", type: "address" },
      { indexed: true, name: "fromDelegate", type: "address" },
      { indexed: true, name: "toDelegate", type: "address" },
    ],
  },
  {
    type: "event",
    name: "DelegateVotesChanged",
    inputs: [
      { indexed: true, name: "delegate", type: "address" },
      { indexed: false, name: "previousVotes", type: "uint256" },
      { indexed: false, name: "newVotes", type: "uint256" },
    ],
  },
  { type: "event", name: "EIP712DomainChanged" },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "CLOCK_MODE",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "DOMAIN_SEPARATOR",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "burn",
    inputs: [{ name: "value", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burnFrom",
    inputs: [
      { name: "account", type: "address" },
      { name: "value", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "castHash",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "clock",
    outputs: [{ name: "", type: "uint48" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "delegate",
    inputs: [{ name: "delegatee", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "delegateBySig",
    inputs: [
      { name: "delegatee", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "delegates",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deployer",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "eip712Domain",
    outputs: [
      { name: "fields", type: "bytes1" },
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
      { name: "extensions", type: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "fid",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPastTotalSupply",
    inputs: [{ name: "timepoint", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPastVotes",
    inputs: [
      { name: "account", type: "address" },
      { name: "timepoint", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVotes",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "image",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nonces",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "numCheckpoints",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "permit",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "version",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
] as const;

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

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

const ContractDefinedSpace = ({
  spaceId: providedSpaceId,
  tabName: providedTabName,
  pinnedCastId,
  contractAddress: initialContractAddress,
  ownerId,
  ownerIdType,
}: {
  spaceId: string | null;
  tabName: string;
  contractAddress: string;
  pinnedCastId?: string;
  ownerId: string | number | null;
  ownerIdType: OwnerType;
}) => {
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

  const { data: rawCastHash, error: castHashError } = useReadContract({
    address: contractAddress as Address,
    abi: clankerTokenAbi,
    functionName: "castHash",
  });
  console.log("Raw Cast Hash:", rawCastHash);
  const { data: rawFid, error: fidError } = useReadContract({
    address: contractAddress as Address,
    abi: clankerTokenAbi,
    functionName: "fid",
  });
  console.log("Raw Fid:", rawFid);
  const { data: rawSymbol, error: symbolError } = useReadContract({
    address: contractAddress as Address,
    abi: clankerTokenAbi,
    functionName: "symbol",
  });

  useEffect(() => {
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
  }, [rawCastHash, rawFid, rawSymbol, castHashError, fidError, symbolError]);

  const INITIAL_PERSONAL_SPACE_CONFIG = useMemo(
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
  console.log("Current Config:", currentConfig);

  const config = useMemo(() => {
    const fetchConfig = async () => {
      const initialConfig = await INITIAL_PERSONAL_SPACE_CONFIG;
      return {
        ...(currentConfig?.tabs?.[providedTabName] || initialConfig),
        isEditable,
      };
    };
    return fetchConfig();
  }, [
    currentConfig,
    providedTabName,
    INITIAL_PERSONAL_SPACE_CONFIG,
    isEditable,
  ]);

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
    const initialConfig = await INITIAL_PERSONAL_SPACE_CONFIG;
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
  }, [spaceId, INITIAL_PERSONAL_SPACE_CONFIG, remoteSpaces, providedTabName]);

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
      INITIAL_PERSONAL_SPACE_CONFIG.then((config) => {
        setResolvedConfig({ ...config, isEditable: false });
      });
    }
  }, [resolvedConfig, INITIAL_PERSONAL_SPACE_CONFIG]);

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

export default ContractDefinedSpace;
