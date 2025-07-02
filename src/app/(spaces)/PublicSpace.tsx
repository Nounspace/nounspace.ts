"use client";

import React from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { useSidebarContext } from "@/common/components/organisms/Sidebar";
import TabBar from "@/common/components/organisms/TabBar";
import TabBarSkeleton from "@/common/components/organisms/TabBarSkeleton";
import { useAppStore } from "@/common/data/stores/app";
import { MasterToken } from "@/common/providers/TokenProvider";
import { createEditabilityChecker } from "@/common/utils/spaceEditability";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { INITIAL_SPACE_CONFIG_EMPTY } from "@/constants/initialPersonSpace";
import Profile from "@/fidgets/ui/profile";
import { useWallets } from "@privy-io/react-auth";
import { indexOf, isNil, mapValues, noop } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { SpaceConfigSaveDetails } from "./Space";
import SpaceLoading from "./SpaceLoading";
import SpacePage from "./SpacePage";
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
  const {
    clearLocalSpaces,
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
    saveLocalSpaceTab: state.space.saveLocalSpaceTab,
    commitSpaceTab: state.space.commitSpaceTabToDatabase,
    loadSpaceTabOrder: state.space.loadSpaceTabOrder,
    updateSpaceTabOrder: state.space.updateLocalSpaceOrder,
    commitSpaceTabOrder: state.space.commitSpaceOrderToDatabase,
    registerSpaceFid: state.space.registerSpaceFid,
    registerSpaceContract: state.space.registerSpaceContract,
  }));

  console.log("PublicSpace mounted:", {
    spaceId: providedSpaceId,
    tabName: providedTabName,
    isTokenPage,
    contractAddress,
    pageType, // Log the page type
  });

  const router = useRouter();

  const initialLoading =
    providedSpaceId !== null &&
    providedSpaceId !== "" &&
    !localSpaces[providedSpaceId];

  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { wallets } = useWallets();

  // Clear cache only when switching to a different space
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    if (
      providedSpaceId &&
      currentSpaceId &&
      currentSpaceId !== providedSpaceId
    ) {
      console.log(
        `Switching space from ${currentSpaceId} to ${providedSpaceId} - clearing cache`
      );
      clearLocalSpaces();
      loadedTabsRef.current = {};
      initialDataLoadRef.current = false;
    }
  }, [clearLocalSpaces, getCurrentSpaceId, providedSpaceId]);

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

    console.log("Editability check:", {
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

  console.log("Resolved page type:", resolvedPageType);

  // Control to avoid infinite space/tab update cycles
  const prevSpaceId = useRef<string | null>(null);
  const prevTabName = useRef<string | null>(null);

  useEffect(() => {
    // Reset initialDataLoadRef only when switching spaces
    if (prevSpaceId.current !== providedSpaceId) {
      initialDataLoadRef.current = false;
    }

    let nextSpaceId = providedSpaceId;
    let nextTabName = decodeURIComponent(providedTabName);

    const localSpacesSnapshot = localSpaces;

    if (resolvedPageType === "token" && contractAddress && tokenData?.network) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (space) =>
          space.contractAddress === contractAddress &&
          space.network === tokenData.network
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(providedTabName);
      }
    } else if (resolvedPageType === "person" && spaceOwnerFid) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (space) => space.fid === spaceOwnerFid
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(providedTabName);
      }
    } else if (resolvedPageType === "proposal") {
      // logic for proposal
    }

    setCurrentSpaceId(nextSpaceId);
    prevSpaceId.current = nextSpaceId;
    setCurrentTabName(nextTabName);
    prevTabName.current = nextTabName;

    // Create space locally if it doesn't exist yet
    if (typeof nextSpaceId === "string" && !localSpacesSnapshot[nextSpaceId]) {
      console.log(
        "Creating local space with initial config for spaceId:",
        nextSpaceId
      );
      (async () => {
        try {
          await createSpaceTab(
            nextSpaceId as string,
            nextTabName || "Profile",
            { ...initialConfig },
            tokenData?.network
          );
        } catch (error) {
          console.error("Failed to create initial space tab:", error);
        }
      })();
    }

    // localSpaces is not in the dependencies!
  }, [
    resolvedPageType,
    providedSpaceId,
    providedTabName,
    contractAddress,
    tokenData?.network,
    spaceOwnerFid,
    setCurrentSpaceId,
    setCurrentTabName,
  ]);

  // Function to load remaining tabs
  const loadRemainingTabs = useCallback(
    async (spaceId: string) => {
      const currentTabName = getCurrentTabName() ?? "Profile";
      const tabOrder = localSpaces[spaceId]?.order || [];

      // Initialize the set of loaded tabs for this space if it doesn't exist
      if (!loadedTabsRef.current[spaceId]) {
        loadedTabsRef.current[spaceId] = new Set();
      }

      // Mark the current tab as loaded
      loadedTabsRef.current[spaceId].add(currentTabName);

      // Load only tabs that haven't been loaded yet
      const tabsToLoad = tabOrder.filter(
        (tabName) =>
          tabName !== currentTabName &&
          !loadedTabsRef.current[spaceId].has(tabName)
      );

      console.log(
        `Loading ${tabsToLoad.length} remaining tabs for space ${spaceId}`
      );

      // Load the remaining tabs in parallel and mark them as loaded
      if (tabsToLoad.length > 0) {
        await Promise.all(
          tabsToLoad.map(async (tabName) => {
            await loadSpaceTab(spaceId, tabName, currentUserFid || undefined);
            loadedTabsRef.current[spaceId].add(tabName);
          })
        );
        console.log(
          `Tabs loaded and cached: ${Array.from(loadedTabsRef.current[spaceId]).join(", ")}`
        );
      }
    },
    [localSpaces, getCurrentTabName, loadSpaceTab, currentUserFid]
  );

  // Track if initial data load already happened
  const initialDataLoadRef = useRef(
    providedSpaceId !== null && !!localSpaces[providedSpaceId]
  );
  const isLoadingRef = useRef(false);
  // Keeps track of which tabs have already been loaded for each space
  const loadedTabsRef = useRef<Record<string, Set<string>>>({});

  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";

    // Avoid repeated simultaneous loading or when reloading is not necessary
    if (isLoadingRef.current) {
      return;
    }

    console.log("Loading space tab:", {
      currentSpaceId,
      currentTabName,
      loading,
      initialLoad: initialDataLoadRef.current,
    });

    if (!isNil(currentSpaceId)) {
      let loadPromise;

      if (!initialDataLoadRef.current) {
        // First load - load everything from the database
        isLoadingRef.current = true;
        setLoading(true);
        loadPromise = loadSpaceTabOrder(currentSpaceId)
          .then(() => {
            console.log("Loaded space tab order");
            return loadEditableSpaces();
          })
          .then(() => {
            console.log("Loaded editable spaces");
            // Load the current tab from the database
            return loadSpaceTab(
              currentSpaceId,
              currentTabName,
              currentUserFid || undefined
            ).catch(async (error) => {
              console.log(
                "Space not found in database, creating local space with initial config:",
                error
              );
              // If space doesn't exist, create it locally with initial configuration
              if (!localSpaces[currentSpaceId]) {
                await createSpaceTab(
                  currentSpaceId,
                  currentTabName,
                  { ...initialConfig },
                  tokenData?.network
                );
              }
            });
          });
      } else {
        // Navigation between tabs - check if we already have the tab in local cache
        const tabExists = localSpaces[currentSpaceId]?.tabs?.[currentTabName];
        // Also check if the tab is marked as loaded in our registry
        const isTabCached =
          loadedTabsRef.current[currentSpaceId]?.has(currentTabName);

        if (!tabExists && !isTabCached) {
          // If the tab is not in local cache, load it from the database
          isLoadingRef.current = true;
          setLoading(true);
          console.log(
            `Tab ${currentTabName} not in cache, loading from database`
          );
          loadPromise = loadSpaceTab(
            currentSpaceId,
            currentTabName,
            currentUserFid || undefined
          ).catch(async (error) => {
            console.log(
              "Tab not found in database, creating local tab with initial config:",
              error
            );
            // If tab doesn't exist, create it locally with initial configuration
            if (!localSpaces[currentSpaceId]?.tabs?.[currentTabName]) {
              await createSpaceTab(
                currentSpaceId,
                currentTabName,
                { ...initialConfig },
                tokenData?.network
              );
            }
          });
        } else {
          // Use the cached version and skip skeleton
          setLoading(false);
          isLoadingRef.current = false;
          console.log(
            `Using tab ${currentTabName} from local cache, avoiding skeleton`
          );
          loadPromise = Promise.resolve();

          // Ensure that the tab is registered as loaded
          if (!loadedTabsRef.current[currentSpaceId]) {
            loadedTabsRef.current[currentSpaceId] = new Set();
          }
          loadedTabsRef.current[currentSpaceId].add(currentTabName);
        }
      }

      loadPromise
        .then(() => {
          console.log("Loaded space tab from database or using cache");
          setLoading(false);
          isLoadingRef.current = false;
          initialDataLoadRef.current = true;

          // Mark the current tab as loaded in our registry
          if (currentSpaceId) {
            if (!loadedTabsRef.current[currentSpaceId]) {
              loadedTabsRef.current[currentSpaceId] = new Set();
            }
            loadedTabsRef.current[currentSpaceId].add(currentTabName);
            console.log(
              `Tab ${currentTabName} marked as loaded for space ${currentSpaceId}`
            );
          }

          // Load remaining tabs in the background if necessary
          if (currentSpaceId && !initialDataLoadRef.current) {
            void loadRemainingTabs(currentSpaceId);
          }
        })
        .catch((error) => {
          console.error("Error loading space:", error);
          setLoading(false);
          isLoadingRef.current = false;
        });
    }
  }, [
    getCurrentSpaceId,
    getCurrentTabName,
    loadSpaceTabOrder,
    loadEditableSpaces,
    loadSpaceTab,
    loadRemainingTabs,
  ]);

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
    console.log(
      "Current space config is undefined, using initial config as fallback"
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
    return config;
  }, [
    Object.keys(config?.fidgetInstanceDatums || {})
      .sort()
      .join(","),
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

            const newUrl = getSpacePageUrl("Profile");
            router.replace(newUrl);
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
            const newUrl = getSpacePageUrl("Profile");
            router.replace(newUrl);
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

      console.log("Saving space config:", {
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
    [getCurrentSpaceId, getCurrentTabName, config.fidgetInstanceDatums]
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

    // Check if we already have the tab in cache
    const tabExists =
      currentSpaceId && localSpaces[currentSpaceId]?.tabs?.[tabName];

    if (currentSpaceId && !tabExists) {
      // Show skeleton when loading a tab from the database
      setLoading(true);
      console.log(`Tab ${tabName} not in cache, loading from database`);
      // Mark as loaded to avoid loading again
      if (loadedTabsRef.current[currentSpaceId]) {
        loadedTabsRef.current[currentSpaceId].add(tabName);
      } else {
        loadedTabsRef.current[currentSpaceId] = new Set([tabName]);
      }

      // Load the tab showing the skeleton for better UX
      loadSpaceTab(currentSpaceId, tabName, currentUserFid || undefined).catch(
        (error) => console.error(`Error loading tab ${tabName}:`, error)
      );
    } else if (currentSpaceId && tabExists) {
      // Tab already in cache - no need to show skeleton
      if (!loadedTabsRef.current[currentSpaceId]) {
        loadedTabsRef.current[currentSpaceId] = new Set();
      }
      loadedTabsRef.current[currentSpaceId].add(tabName);
      setLoading(false);
    }

    if (currentSpaceId && shouldSave) {
      const resolvedConfig = await config;
      await saveLocalSpaceTab(currentSpaceId, currentTabName, resolvedConfig);
      await commitSpaceTab(currentSpaceId, currentTabName, tokenData?.network);
    }
    // Update the URL without triggering a full navigation
    router.push(getSpacePageUrl(tabName));
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

  const MemoizedSpacePage = useMemo(
    () => (
      <SpacePage
        config={memoizedConfig}
        saveConfig={saveConfig}
        commitConfig={commitConfig}
        resetConfig={resetConfig}
        tabBar={tabBar}
        profile={profile ?? undefined}
      />
    ),
    [memoizedConfig, saveConfig, commitConfig, resetConfig, tabBar, profile]
  );

  // Mostra o skeleton apenas durante o carregamento inicial do espaço, não durante troca de abas
  const shouldShowSkeleton =
    loading &&
    // Mostrar skeleton apenas quando ainda não carregamos dados iniciais
    !initialDataLoadRef.current &&
    // Não mostrar skeleton para navegação entre abas
    providedSpaceId !== null &&
    providedSpaceId !== "" &&
    // Evita mostrar skeleton para abas que já foram carregadas
    !(
      loadedTabsRef.current[getCurrentSpaceId() ?? ""] &&
      loadedTabsRef.current[getCurrentSpaceId() ?? ""].has(
        getCurrentTabName() ?? "Profile"
      )
    );

  if (shouldShowSkeleton) {
    return (
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
                  hasProfile={
                    !isTokenPage && !!spaceOwnerFid && pageType !== "proposal"
                  }
                  hasFeed={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return MemoizedSpacePage;
}
