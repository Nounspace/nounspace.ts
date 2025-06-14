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

  const clearLocalSpaces = useAppStore((state) => state.clearLocalSpaces);

  console.log("PublicSpace mounted:", {
    spaceId: providedSpaceId,
    tabName: providedTabName,
    isTokenPage,
    contractAddress,
    pageType, // Log the page type
  });

  const router = useRouter();
  const [loading, setLoading] = useState(
    providedSpaceId !== null && providedSpaceId !== "",
  );
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
  
 // Clear local spaces and force data reload when mounting the component
  const didInitialize = useRef(false);
  useEffect(() => {
    if (!didInitialize.current && clearLocalSpaces && providedSpaceId) {
      console.log("Inicializando componente - limpando cache e forçando recarregamento");
      clearLocalSpaces();
      
      didInitialize.current = true;
      
      initialDataLoadRef.current = false;
    }
  }, [clearLocalSpaces, providedSpaceId]);

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
    [editabilityCheck],
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
    // Reset initialDataLoadRef whenever changing spaces
    if (prevSpaceId.current !== providedSpaceId || prevTabName.current !== providedTabName) {
      initialDataLoadRef.current = false;
    }
    
    let nextSpaceId = providedSpaceId;
    let nextTabName = decodeURIComponent(providedTabName);

    const localSpacesSnapshot = localSpaces;

    if (resolvedPageType === "token" && contractAddress && tokenData?.network) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (space) =>
          space.contractAddress === contractAddress &&
          space.network === tokenData.network,
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(providedTabName);
      }
    } else if (resolvedPageType === "person" && spaceOwnerFid) {
      const existingSpace = Object.values(localSpacesSnapshot).find(
        (space) => space.fid === spaceOwnerFid,
      );
      if (existingSpace) {
        nextSpaceId = existingSpace.id;
        nextTabName = decodeURIComponent(providedTabName);
      }
    } else if (resolvedPageType === "proposal") {
      // logic for proposal
    }

    if (prevSpaceId.current !== nextSpaceId) {
      setCurrentSpaceId(nextSpaceId);
      prevSpaceId.current = nextSpaceId;
    }
    if (prevTabName.current !== nextTabName) {
      setCurrentTabName(nextTabName);
      prevTabName.current = nextTabName;
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
      const currentTabName = getCurrentTabName();
      const tabOrder = localSpaces[spaceId]?.order || [];
     // Forces all database tabs to load
      await Promise.all(
        tabOrder
          .filter((tabName) => tabName !== currentTabName)
          .map((tabName) => loadSpaceTab(spaceId, tabName, currentUserFid || undefined)),
      );
    },
    [localSpaces, getCurrentTabName, loadSpaceTab, currentUserFid],
  );

  // Track if initial data load already happened
  const initialDataLoadRef = useRef(false);
  const isLoadingRef = useRef(false);
  
  // Loads and sets up the user's space tab when providedSpaceId or providedTabName changes
  useEffect(() => {
    const currentSpaceId = getCurrentSpaceId();
    const currentTabName = getCurrentTabName() ?? "Profile";
    
// Avoid repeated simultaneous loading or when reloading is not necessary
    if (isLoadingRef.current || (initialDataLoadRef.current && !didInitialize.current)) {
      return;
    }

    console.log("Loading space tab:", {
      currentSpaceId,
      currentTabName,
      loading,
      initialLoad: initialDataLoadRef.current,
      didInitialize: didInitialize.current
    });

    if (!isNil(currentSpaceId)) {
      isLoadingRef.current = true;
      setLoading(true);
      
      let loadPromise;
      
      if (!initialDataLoadRef.current || didInitialize.current) {
        loadPromise = loadSpaceTabOrder(currentSpaceId)
          .then(() => {
            console.log("Loaded space tab order");
            return loadEditableSpaces();
          })
          .then(() => {
            console.log("Loaded editable spaces");
            return loadSpaceTab(currentSpaceId, currentTabName, currentUserFid || undefined);
          });
      } else {
        loadPromise = Promise.resolve();
      }
      
      loadPromise
        .then(() => {
          console.log("Loaded space tab from database or using cache");
          setLoading(false);
          isLoadingRef.current = false;
          initialDataLoadRef.current = true;
          
          if (currentSpaceId && didInitialize.current) {
            void loadRemainingTabs(currentSpaceId);
            didInitialize.current = false;
          }
        })
        .catch((error) => {
          console.error("Error loading space:", error);
          setLoading(false);
          isLoadingRef.current = false;
        });
    }
  }, [getCurrentSpaceId, getCurrentTabName, loadSpaceTabOrder, loadEditableSpaces, loadSpaceTab, loadRemainingTabs]);

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
    return config;
  }, [
    Object.keys(config?.fidgetInstanceDatums || {}).sort().join(','),
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
                space.network === tokenData.network,
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
              (space) => space.fid === currentUserFid,
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
              tokenData.network,
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
              getSpacePageUrl("Profile"),
            );
            // console.log("User space registration result:", {
            //   success: !!newSpaceId,
            //   newSpaceId,
            //   currentUserFid,
            // });

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
    [getCurrentSpaceId, getCurrentTabName]
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
        remoteSpaces[currentSpaceId].tabs[currentTabName],
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
            tokenData?.network as EtherScanChainName,
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
            tokenData?.network as EtherScanChainName,
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
            newName,
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
            tokenData?.network as EtherScanChainName,
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

  const MemoizedSpacePage = useMemo(() => (
    <SpacePage
      config={memoizedConfig}
      saveConfig={saveConfig}
      commitConfig={commitConfig}
      resetConfig={resetConfig}
      tabBar={tabBar}
      profile={profile ?? undefined}
    />
  ), [memoizedConfig, saveConfig, commitConfig, resetConfig, tabBar, profile]);
  
  const shouldShowSkeleton =
    loading && providedSpaceId !== null && providedSpaceId !== "";

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