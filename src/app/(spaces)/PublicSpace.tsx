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
import { createEditabilityChecker } from "@/common/utils/spaceEditability";
import { revalidatePath } from "next/cache";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import logger from "@/common/lib/logger";
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
  logger.debug("PublicSpace mounted:", {
    spaceId: providedSpaceId,
    tabName: providedTabName,
    isTokenPage,
    contractAddress,
    pageType, // Log the page type
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
    const checker = createEditabilityChecker({
      currentUserFid,
      spaceOwnerFid,
      spaceOwnerAddress,
      tokenData,
      wallets: wallets.map((w) => ({ address: w.address as Address })),
      isTokenPage,
    });

    logger.debug("Editability check:", {
      isEditable: checker.isEditable,
      isLoading: checker.isLoading,
      currentUserFid,
      spaceOwnerFid,
      spaceOwnerAddress,
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
    if (providedSpaceId?.startsWith("proposal:")) return "proposal";
    return "person"; // Default to person page
  }, [pageType, isTokenPage, spaceOwnerFid, providedSpaceId]);

  logger.debug("Resolved page type:", resolvedPageType);

  // Sets the current space and tab name on initial load
  useEffect(() => {
    logger.debug(
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
        logger.debug("Found existing token space:", {
          spaceId: existingSpace.id,
          contractAddress,
          network: tokenData.network,
        });
        setCurrentSpaceId(existingSpace.id);
        setCurrentTabName(decodeURIComponent(providedTabName));
        return;
      }
    } else if (resolvedPageType === "person" && spaceOwnerFid) {
      const existingSpace = Object.values(localSpaces).find(
        (space) => space.fid === spaceOwnerFid
      );

      if (existingSpace) {
        logger.debug("Found existing user space:", {
          spaceId: existingSpace.id,
          spaceOwnerFid,
        });
        setCurrentSpaceId(existingSpace.id);
        setCurrentTabName(decodeURIComponent(providedTabName));
        return;
      }
    } else if (resolvedPageType === "proposal") {
      logger.debug("Handling proposal page logic...");
      // Add specific logic for proposal pages here
    }

    // If no existing space found locally, use the provided spaceId
    setCurrentSpaceId(providedSpaceId);
    setCurrentTabName(decodeURIComponent(providedTabName));
  }, [
    resolvedPageType,
    providedSpaceId,
    providedTabName,
    contractAddress,
    tokenData?.network,
    spaceOwnerFid,
    localSpaces,
  ]);

  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName();

    logger.debug("Loading space tab:", {
      currentSpaceId,
      currentTabName,
      loading,
    });

    if (!isNil(currentSpaceId)) {
      setLoading(true);
      // First, load the space tab order
      loadSpaceTabOrder(currentSpaceId)
        .then(() => {
          logger.debug("Loaded space tab order");
          return loadEditableSpaces();
        })
        .then(() => {
          logger.debug("Loaded editable spaces");
          // Load the specific tab
          return loadSpaceTab(currentSpaceId, currentTabName ?? "Profile");
        })
        .then(() => {
          logger.debug("Loaded space tab");
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
  if (!currentConfig) {
    console.error("Current space config is undefined");
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
    logger.debug("Space registration check:", {
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
      logger.debug("Space registration conditions met:", {
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
              logger.debug("Found existing space in local cache:", {
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
              logger.debug("Found existing user space in local cache:", {
                spaceId: existingSpace.id,
                currentUserFid,
              });
              setCurrentSpaceId(existingSpace.id);
              setCurrentTabName("Profile");
              return;
            }
          }

          if (isTokenPage && contractAddress && tokenData?.network) {
            logger.debug("Attempting to register contract space:", {
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
            logger.debug("Contract space registration result:", {
              success: !!newSpaceId,
              newSpaceId,
              contractAddress,
            });
          } else if (!isTokenPage) {
            logger.debug("Attempting to register user space:", {
              currentUserFid,
            });
            newSpaceId = await registerSpaceFid(
              currentUserFid,
              "Profile",
              getSpacePageUrl("Profile")
            );
            // logger.debug("User space registration result:", {
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
      const currentSpaceId = getCurrentSpaceId();
      const currentTabName = getCurrentTabName() ?? "Profile";

      logger.debug("Saving space config:", {
        spaceId: currentSpaceId,
        tabName: currentTabName,
        fidgetCount: Object.keys(spaceConfig.fidgetInstanceDatums || {}).length,
      });

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
    [getCurrentSpaceId, getCurrentTabName]
  );

  const commitConfig = useCallback(async () => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";

    logger.debug("Committing space config:", {
      spaceId: currentSpaceId,
      tabName: currentTabName,
    });

    if (isNil(currentSpaceId)) return;
    commitSpaceTab(currentSpaceId, currentTabName, tokenData?.network);
  }, [getCurrentSpaceId, getCurrentTabName, tokenData?.network]);

  const resetConfig = useCallback(async () => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";

    logger.debug("Resetting space config:", {
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

    logger.debug("Switching tab:", {
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

  const tabBar = (
    <TabBar
      isTokenPage={isTokenPage}
      pageType={pageType}
      inHomebase={false}
      currentTab={getCurrentTabName() ?? "Profile"}
      tabList={
        getCurrentSpaceId()
          ? localSpaces[getCurrentSpaceId()!]?.order
          : ["Profile"]
      }
      contractAddress={contractAddress as Address}
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
              tokenData?.network as EtherScanChainName
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
              tokenData?.network as EtherScanChainName
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
            newName
          );
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
          ? commitSpaceTabOrder(
              currentSpaceId,
              tokenData?.network as EtherScanChainName
            )
          : undefined;
      }}
      getSpacePageUrl={getSpacePageUrl}
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
