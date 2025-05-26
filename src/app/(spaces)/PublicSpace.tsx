"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { createEditabilityChecker } from "@/common/utils/spaceEditability";
import { revalidatePath } from "next/cache";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import { useProposalContext } from "@/common/providers/ProposalProvider";
import { v4 as uuidv4 } from "uuid";
const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export type SpacePageType = "profile" | "token" | "proposal";

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
  // New prop to identify page type
  pageType?: SpacePageType;
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
  pageType, // New prop
}: PublicSpaceProps) {
  // Add this ref to guard proposal registration
  const proposalRegistrationRef = useRef<string | null>(null);

  console.log("PublicSpace mounted:", {
    spaceId: providedSpaceId,
    tabName: providedTabName,
    isTokenPage,
    contractAddress,
    pageType,
    spaceOwnerFid, // Log the page type
  });
  console.debug("[PublicSpace] props", {
    providedSpaceId,
    providedTabName,
    spaceOwnerFid,
    spaceOwnerAddress,
    isTokenPage,
    contractAddress,
    pageType,
  });

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
    registerProposalSpace,
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
    registerProposalSpace: state.space.registerProposalSpace,
  }));

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  // Create an editability checker
  const editabilityCheck = useMemo(() => {
    const checker = createEditabilityChecker({
      currentUserFid,
      spaceOwnerFid,
      spaceOwnerAddress,
      tokenData,
      wallets: wallets.map((w) => ({ address: w.address as Address })),
      isTokenPage,
    });

    // Enhanced debug log for editability
    console.log("Editability check:", {
      isEditable: checker.isEditable,
      isLoading: checker.isLoading,
      currentUserFid,
      spaceOwnerFid,
      spaceOwnerAddress,
      walletAddresses: wallets.map((w) => w.address),
      // Show if any wallet matches the spaceOwnerAddress
      ownsSpaceOwnerAddress:
        spaceOwnerAddress &&
        wallets.some(
          (w) => w.address?.toLowerCase() === spaceOwnerAddress?.toLowerCase()
        ),
    });

    return checker;
  }, [
    currentUserFid,
    spaceOwnerFid,
    spaceOwnerAddress,
    tokenData,
    wallets,
    isTokenPage,
  ]);

  // Internal isEditable function
  const isEditable = useCallback(
    (userFid: number) => {
      return editabilityCheck.isEditable;
    },
    [editabilityCheck]
  );

  // Determine the page type if not explicitly provided
  const resolvedPageType = useMemo(() => {
    if (pageType) return pageType;
    if (isTokenPage) return "token";
    if (spaceOwnerFid) return "person";
    if (
      providedSpaceId?.startsWith("proposal:") ||
      pageType === "proposal" ||
      !!spaceOwnerAddress
    )
      return "proposal";
    return "person"; // Default to person page
  }, [
    pageType,
    isTokenPage,
    spaceOwnerFid,
    providedSpaceId,
    spaceOwnerAddress,
  ]);

  console.log("Resolved page type:", resolvedPageType);

  // Cache these values ONCE per render to avoid infinite loops
  const currentSpaceId = getCurrentSpaceId();
  const currentTabName = getCurrentTabName();

  // Sets the current space and tab name on initial load
  useEffect(() => {
    console.log(
      "Setting current space and tab for page type:",
      resolvedPageType
    );

    if (resolvedPageType === "token" && contractAddress && tokenData?.network) {
      const existingSpace = Object.values(localSpaces).find(
        (space) =>
          space.contractAddress === contractAddress &&
          space.network === tokenData.network
      );
      if (existingSpace) {
        if (currentSpaceId !== existingSpace.id)
          setCurrentSpaceId(existingSpace.id);
        if (currentTabName !== decodeURIComponent(providedTabName))
          setCurrentTabName(decodeURIComponent(providedTabName));
        return;
      }
    } else if (resolvedPageType === "person" && spaceOwnerFid) {
      const existingSpace = Object.values(localSpaces).find(
        (space) => space.fid === spaceOwnerFid
      );
      if (existingSpace) {
        if (currentSpaceId !== existingSpace.id)
          setCurrentSpaceId(existingSpace.id);
        if (currentTabName !== decodeURIComponent(providedTabName))
          setCurrentTabName(decodeURIComponent(providedTabName));
        return;
      }
    } else if (resolvedPageType === "proposal") {
      // Only register once per proposalId
      if (
        providedSpaceId &&
        proposalRegistrationRef.current !== providedSpaceId &&
        spaceOwnerAddress &&
        spaceOwnerFid &&
        currentUserFid === spaceOwnerFid
      ) {
        const registerProposalSpaceHandler = async () => {
          try {
            console.debug("Starting proposal space registration", {
              providedSpaceId,
              spaceOwnerAddress,
              spaceOwnerFid,
            });

            // Define proposalSpaceId based on providedSpaceId
            const proposalSpaceId = providedSpaceId;

            // Ensure editable spaces are loaded
            await loadEditableSpaces();

            // Register the proposal space if not already registered
            await registerProposalSpace({
              proposalId: providedSpaceId,
              spaceId: proposalSpaceId,
              fid: spaceOwnerFid,
              proposerAddress: spaceOwnerAddress,
            });

            console.debug("Proposal space registered successfully", {
              proposalSpaceId,
            });
            proposalRegistrationRef.current = proposalSpaceId;

            // Load the space tab order and the default tab
            await loadSpaceTabOrder(proposalSpaceId);
            await loadSpaceTab(
              proposalSpaceId,
              decodeURIComponent(providedTabName) || "Profile"
            );

            // Update the current space ID in the state
            setCurrentSpaceId(proposalSpaceId);
            console.debug("Updated currentSpaceId in state", {
              currentSpaceId: proposalSpaceId,
            });

            // Force navigation to the new space's canonical URL
            const newUrl = getSpacePageUrl(
              decodeURIComponent(providedTabName) || "Profile"
            );
            router.replace(newUrl, { scroll: false });
            setLoading(false);
          } catch (error) {
            console.error("Error registering proposal space:", error);
          }
        };
        registerProposalSpaceHandler();
      }
      return;
    }
    // If no existing space found locally, use the provided spaceId
    if (currentSpaceId !== providedSpaceId) setCurrentSpaceId(providedSpaceId);
    if (currentTabName !== decodeURIComponent(providedTabName))
      setCurrentTabName(decodeURIComponent(providedTabName));
  }, [
    resolvedPageType,
    providedSpaceId,
    providedTabName,
    contractAddress,
    tokenData?.network,
    spaceOwnerFid,
    localSpaces,
    spaceOwnerAddress,
    currentSpaceId,
    currentTabName,
    setCurrentSpaceId,
    setCurrentTabName,
    registerProposalSpace,
  ]);

  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName();

    console.log("Loading space tab:", {
      currentSpaceId,
      currentTabName,
      loading,
    });

    if (!isNil(currentSpaceId)) {
      setLoading(true);
      // First, load the space tab order
      loadSpaceTabOrder(currentSpaceId)
        .then(() => {
          console.log("Loaded space tab order");
          return loadEditableSpaces();
        })
        .then(() => {
          console.log("Loaded editable spaces");
          // Load the specific tab
          return loadSpaceTab(currentSpaceId, currentTabName ?? "Profile");
        })
        .then(() => {
          console.log("Loaded space tab");
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
    [localSpaces, getCurrentTabName, loadSpaceTab]
  );

  // Checks if the user is signed into Farcaster
  useEffect(() => {
    authManagerGetInitializedAuthenticators().then((authNames) => {
      setIsSignedIntoFarcaster(
        indexOf(authNames, FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME) > -1
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
  // Only log an error if we have a space ID but no config, which indicates a real issue
  if (!currentConfig && getCurrentSpaceId() && !loading) {
    console.warn(
      "Current space config is undefined for existing space:",
      getCurrentSpaceId()
    );
  }

  const config = {
    ...(currentConfig?.tabs[getCurrentTabName() ?? "Profile"]
      ? currentConfig.tabs[getCurrentTabName() ?? "Profile"]
      : { ...initialConfig }),
    isEditable,
  };

  const memoizedConfig = useMemo(() => {
    if (!config) {
      console.error("Config is undefined");
      return {};
    }
    const { timestamp, ...restConfig } = config;
    return restConfig;
  }, [
    config?.fidgetInstanceDatums,
    config?.layoutID,
    config?.layoutDetails,
    config?.isEditable,
    config?.fidgetTrayContents,
    config?.theme,
  ]);

  // Update the space registration effect to use the new editability check
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    console.log("Space registration check:", {
      isEditable: editabilityCheck.isEditable,
      isLoading: editabilityCheck.isLoading,
      spaceId: currentSpaceId,
      currentUserFid,
      loading,
      isTokenPage,
      contractAddress,
      tokenNetwork: tokenData?.network,
    });

    // Only proceed with registration if we're sure the space doesn't exist and FID is linked
    if (
      editabilityCheck.isEditable &&
      isNil(currentSpaceId) &&
      !isNil(currentUserFid) &&
      !loading &&
      !editabilityCheck.isLoading
    ) {
      console.log("Space registration conditions met:", {
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

          // First check local spaces for existing space
          if (isTokenPage && contractAddress && tokenData?.network) {
            const existingSpace = Object.values(localSpaces).find(
              (space) =>
                space.contractAddress === contractAddress &&
                space.network === tokenData.network
            );

            if (existingSpace) {
              console.log("Found existing space in local cache:", {
                spaceId: existingSpace.id,
                contractAddress,
                network: tokenData.network,
              });
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName("Profile");
              return;
            }
          } else if (!isTokenPage) {
            const existingSpace = Object.values(localSpaces).find(
              (space) => space.fid === currentUserFid
            );

            if (existingSpace) {
              console.log("Found existing user space in local cache:", {
                spaceId: existingSpace.id,
                currentUserFid,
              });
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName("Profile");
              return;
            }
          }

          if (isTokenPage && contractAddress && tokenData?.network) {
            console.log("Attempting to register contract space:", {
              contractAddress,
              currentUserFid,
              network: tokenData.network,
            });
            newSpaceId = await registerSpaceContract(
              contractAddress,
              "Profile",
              currentUserFid,
              initialConfig,
              tokenData.network
            );
            console.log("Contract space registration result:", {
              success: !!newSpaceId,
              newSpaceId,
              contractAddress,
            });
          } else if (!isTokenPage) {
            console.log("Attempting to register user space:", {
              currentUserFid,
            });
            newSpaceId = await registerSpaceFid(
              currentUserFid,
              "Profile",
              getSpacePageUrl("Profile")
            );
            // console.log("User space registration result:", {
            //   success: !!newSpaceId,
            //   newSpaceId,
            //   currentUserFid,
            // });

            revalidatePath(getSpacePageUrl("Profile"));
            const newUrl = getSpacePageUrl("Profile");
            router.replace(newUrl, { scroll: false });
          }

          if (newSpaceId) {
            // Set both spaceId and currentSpaceId atomically
            setCurrentSpaceId(newSpaceId);
            setCurrentTabName("Profile");

            // Load the space data after registration
            await loadSpaceTabOrder(newSpaceId);
            await loadEditableSpaces(); // First load
            await loadSpaceTab(newSpaceId, "Profile");

            // Load remaining tabs
            const tabOrder = localSpaces[newSpaceId]?.order || [];
            for (const tabName of tabOrder) {
              if (tabName !== "Profile") {
                await loadSpaceTab(newSpaceId, tabName);
              }
            }

            // Invalidate cache by reloading editable spaces
            await loadEditableSpaces(); // Second load to invalidate cache

            // Update the URL to include the new space ID
            revalidatePath(getSpacePageUrl("Profile"));
            const newUrl = getSpacePageUrl("Profile");
            router.replace(newUrl, { scroll: false });
          }
        } catch (error) {
          console.error("Error during space registration:", error);
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
    localSpaces,
  ]);

  const saveConfig = useCallback(
    async (spaceConfig: SpaceConfigSaveDetails) => {
      let currentSpaceId = getCurrentSpaceId();
      const currentTabName = getCurrentTabName() ?? "Profile";

      if (isNil(currentSpaceId)) {
        // Try to reload local spaces from backend
        await loadEditableSpaces();
        // Try to find the space again
        currentSpaceId = getCurrentSpaceId();
        if (isNil(currentSpaceId)) {
          console.error(
            "Cannot save config: Space is not registered (even after reload).",
            {
              localSpaces,
              providedSpaceId,
            }
          );
          throw new Error("Cannot save config until space is registered");
        }
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
    [
      getCurrentSpaceId,
      getCurrentTabName,
      loadEditableSpaces,
      localSpaces,
      providedSpaceId,
    ]
  );

  const commitConfig = useCallback(async () => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";

    console.log("Committing space config:", {
      spaceId: currentSpaceId,
      tabName: currentTabName,
    });

    if (isNil(currentSpaceId)) return;
    commitSpaceTab(currentSpaceId, currentTabName, tokenData?.network);
  }, [getCurrentSpaceId, getCurrentTabName, tokenData?.network]);

  const resetConfig = useCallback(async () => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";

    console.log("Resetting space config:", {
      spaceId: currentSpaceId,
      tabName: currentTabName,
    });

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
        remoteSpaces[currentSpaceId].tabs[currentTabName]
      );
    }
  }, [getCurrentSpaceId, initialConfig, remoteSpaces, getCurrentTabName]);

  // Common tab management
  async function switchTabTo(tabName: string, shouldSave: boolean = true) {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";

    console.log("Switching tab:", {
      from: currentTabName,
      to: tabName,
      shouldSave,
    });

    if (currentSpaceId && shouldSave) {
      const resolvedConfig = await config;
      await saveLocalSpaceTab(currentSpaceId, currentTabName, resolvedConfig);
      await commitSpaceTab(currentSpaceId, currentTabName, tokenData?.network);
    }
    // Update the URL without triggering a full navigation
    router.push(getSpacePageUrl(tabName), { scroll: false });
  }

  const { editMode } = useSidebarContext();

  // Extract proposer address from proposal context if this is a proposal page
  let proposerAddress: string | undefined = undefined;
  if (pageType === "proposal") {
    try {
      proposerAddress = useProposalContext()?.proposalData?.proposer?.id;
    } catch (e) {
      proposerAddress = undefined;
    }
  }

  // Extract proposal-specific props if this is a proposal page
  const proposalIdProp =
    pageType === "proposal" ? providedSpaceId || "" : undefined;

  const tabBar = (
    <TabBar
      isTokenPage={isTokenPage}
      pageType={pageType}
      inHomebase={false}
      currentTab={currentTabName ?? "Profile"}
      tabList={
        currentSpaceId ? localSpaces[currentSpaceId]?.order : ["Profile"]
      }
      contractAddress={contractAddress as Address}
      switchTabTo={switchTabTo}
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
              tokenData?.network as EtherScanChainName
            )
          : undefined;
      }}
      createTab={async (tabName) => {
        return currentSpaceId
          ? createSpaceTab(
              currentSpaceId,
              tabName,
              INITIAL_SPACE_CONFIG_EMPTY,
              tokenData?.network as EtherScanChainName
            )
          : undefined;
      }}
      renameTab={async (oldName, newName) => {
        if (currentSpaceId) {
          const resolvedConfig = await config;
          return saveLocalSpaceTab(
            currentSpaceId,
            oldName,
            resolvedConfig,
            newName
          );
        }
        return undefined;
      }}
      commitTab={async (tabName) => {
        return currentSpaceId
          ? commitSpaceTab(currentSpaceId, tabName, tokenData?.network)
          : undefined;
      }}
      commitTabOrder={async () => {
        return currentSpaceId
          ? commitSpaceTabOrder(
              currentSpaceId,
              tokenData?.network as EtherScanChainName
            )
          : undefined;
      }}
      getSpacePageUrl={getSpacePageUrl}
      // Proposal-specific props
      proposalId={proposalIdProp}
      proposerAddress={proposerAddress}
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

  if (!profile) {
    console.warn("Profile component is undefined");
  }

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
