"use client";
import React from "react";
import { FaPlus, FaPaintbrush } from "react-icons/fa6";
import { map } from "lodash";
import { Reorder, AnimatePresence } from "framer-motion";
import { Tab } from "../atoms/reorderable-tab";
import NogsGateButton from "./NogsGateButton";
import { Address } from "viem";
import { useAppStore } from "@/common/data/stores/app";
import { TooltipProvider } from "../atoms/tooltip";
import TokenDataHeader from "./TokenDataHeader";
import ClaimButtonWithModal from "../molecules/ClaimButtonWithModal";
import useIsMobile from "@/common/lib/hooks/useIsMobile";
import { useMobilePreview } from "@/common/providers/MobilePreviewProvider";
import { SpacePageType } from "@/app/(spaces)/PublicSpace";
import { useSidebarContext } from "./Sidebar";
import { Button } from "../atoms/button";

interface TabBarProps {
  inHome?: boolean;
  inHomebase: boolean;
  inEditMode: boolean;
  currentTab: string;
  tabList: string[];
  updateTabOrder: (newOrder: string[]) => void;
  commitTabOrder: () => void;
  switchTabTo: (tabName: string, shouldSave?: boolean) => void;
  deleteTab: (tabName: string) => void;
  createTab: (tabName: string) => Promise<{ tabName: string } | undefined>;
  renameTab: (tabName: string, newName: string) => void;
  commitTab: (tabName: string) => void;
  getSpacePageUrl: (tabName: string) => string;
  isTokenPage?: boolean;
  contractAddress?: Address;
  pageType?: SpacePageType | undefined;
  isEditable?: boolean;
}

const PERMANENT_TABS = ["Feed", "Profile"];
const isEditableTab = (tabName: string) => !PERMANENT_TABS.includes(tabName);

// Add validation function
const validateTabName = (tabName: string): string | null => {
  if (/[^a-zA-Z0-9-_ ]/.test(tabName)) {
    return "The tab name contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed.";
  }
  return null;
};

function TabBar({
  inHome,
  inHomebase,
  inEditMode,
  currentTab,
  tabList = ["Profile"],
  switchTabTo,
  updateTabOrder,
  commitTabOrder,
  deleteTab,
  createTab,
  renameTab,
  commitTab,
  getSpacePageUrl,
  isTokenPage,
  contractAddress,
  pageType,
  isEditable
}: TabBarProps) {
  const isMobile = useIsMobile();
  const { mobilePreview } = useMobilePreview();
  const { setEditMode } = useSidebarContext();

  const { getIsLoggedIn, getIsInitializing } = useAppStore((state) => ({
    setModalOpen: state.setup.setModalOpen,
    getIsLoggedIn: state.getIsAccountReady,
    getIsInitializing: state.getIsInitializing,
  }));

  function generateNewTabName() {
    const endIndex = tabList.length + 1;
    const base = `Tab ${endIndex}`;
    return generateUniqueTabName(base);
  }

  function generateUniqueTabName(tabName: string) {
    // First validate the base name
    const validationError = validateTabName(tabName);
    if (validationError) {
      throw new Error(validationError);
    }

    let iter = 1;
    let uniqueName = tabName;
    while (tabList.includes(uniqueName)) {
      uniqueName = `${tabName} - ${iter}`;
      // Validate each generated name
      const validationError = validateTabName(uniqueName);
      if (validationError) {
        throw new Error(validationError);
      }
      iter += 1;
    }
    return uniqueName;
  }

  async function handleCreateTab(tabName: string) {
    // Validate the tab name before proceeding
    const validationError = validateTabName(tabName);
    if (validationError) {
      throw new Error(validationError);
    }

    // Start the tab creation process but don't await it
    const creationPromise = createTab(tabName);

    // Switch to the new tab immediately
    switchTabTo(tabName);

    // Handle the remote operations in the background
    creationPromise.then(result => {
      if (result?.tabName) {
        // If the tab name changed during creation, update the URL
        if (result.tabName !== tabName) {
          switchTabTo(result.tabName);
        }
      }
      // Commit the tab order in the background
      commitTabOrder();
    }).catch(error => {
      console.error("Failed to create tab:", error);
      // Optionally show an error message to the user
    });
  }

  async function handleDeleteTab(tabName: string) {
    // Get the next tab before any state changes
    const nextTab = nextClosestTab(tabName);

    try {
      // First update the tab order and delete the tab
      const newOrder = tabList.filter((name) => name !== tabName);
      await updateTabOrder(newOrder);
      await deleteTab(tabName);
      await commitTabOrder();

      switchTabTo(nextTab, false);
    } catch (error) {
      console.error("Failed to delete tab:", error);
      // Optionally add error handling UI here
    }
  }

  async function handleRenameTab(tabName: string, newName: string) {
    // Validate the new name before proceeding
    const validationError = validateTabName(newName);
    if (validationError) {
      throw new Error(validationError);
    }

    const uniqueName = generateUniqueTabName(newName);
    await renameTab(tabName, uniqueName);
    updateTabOrder(
      tabList.map((name) => (name === tabName ? uniqueName : name)),
    );
    await commitTab(uniqueName);
    await commitTabOrder();
    switchTabTo(uniqueName);
  }

  function nextClosestTab(tabName: string) {
    const index = tabList.indexOf(tabName);
    // For middle tabs, prefer the next tab
    if (index >= 0 && index < tabList.length - 1) {
      // If there's a next tab, use it
      return tabList[index + 1];
    } else if (index > 0) {
      // If we're at the end, go to previous tab
      return tabList[index - 1];
    } else if (inHomebase) {
      // If no other tabs, go to Feed
      return "Feed";
    } else {
      // If no other tabs in profile space, go to Profile
      return "Profile";
    }
  }

  const handleTabClick = React.useCallback((tabName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    console.log("Tab clicked:", tabName, "Current tab:", currentTab);

    switchTabTo(tabName, true);
  }, [switchTabTo]);

  const isLoggedIn = getIsLoggedIn();

  return (
    <TooltipProvider>
      <div className="flex flex-col md:flex-row justify-start md:h-16 z-30 bg-white w-full"> 
        {isTokenPage && contractAddress && (
          <div className="flex flex-row justify-start h-16 overflow-y-scroll w-full md:w-fit z-20 bg-white">
            <TokenDataHeader />
          </div>
        )}
        <div className="relative flex flex-auto h-16 bg-white"> 
          {isMobile && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-40 bg-white flex gap-2">
              {!inEditMode && isEditable && !inHomebase && (
                <Button
                  onClick={() => setEditMode(true)}
                  className="items-center flex rounded-xl p-2 bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold shadow-md"
                >
                  <FaPaintbrush />
                </Button>
              )}
              {!inHomebase && (
                <NogsGateButton
                  onClick={() => handleCreateTab(generateNewTabName())}
                  className="items-center flex rounded-xl p-2 bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold shadow-md"
                >
                  <div>
                    <FaPlus />
                  </div>
                  <span className="ml-1">Tab</span>
                </NogsGateButton>
              )}
            </div>
          )}
          <div className={`flex-1 overflow-x-auto scrollbar-hide ${isMobile ? 'pr-16' : 'pr-4'}`}>
            {tabList && (
              <Reorder.Group
                as="ol"
                axis="x"
                onReorder={updateTabOrder}
                className="flex flex-row gap-5 md:gap-4 items-start ml-2 my-4 mr-4 tabs"
                values={tabList}
                style={{
                  maxWidth: isMobile ? 'calc(100% - 60px)' : '100%',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                <AnimatePresence initial={false}>
                  {map(
                    inHomebase
                      ? ["Feed", ...tabList]
                      : tabList,
                    (tabName: string) => {
                      return (
                        <Tab
                          key={tabName}
                          getSpacePageUrl={getSpacePageUrl}
                          tabName={tabName}
                          inEditMode={inEditMode}
                          isSelected={currentTab === tabName}
                          onClick={() => handleTabClick(tabName)}
                          removeable={isEditableTab(tabName)}
                          draggable={inEditMode}
                          renameable={isEditableTab(tabName)}
                          onRemove={() => handleDeleteTab(tabName)}
                          renameTab={handleRenameTab}
                        />
                      );
                    },
                  )}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </div>
        </div>
        {isTokenPage && !getIsInitializing() && !isLoggedIn && !isMobile && (
          <ClaimButtonWithModal contractAddress={contractAddress} />
        )}
        {inEditMode && !mobilePreview && !isMobile ? (
          <div className="mr-36 flex flex-row">
            <NogsGateButton
              onClick={() => handleCreateTab(generateNewTabName())}
              className="items-center flex rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
            >
              <div className="ml-2">
                <FaPlus />
              </div>
              <span className="ml-4 mr-2">Tab</span>
            </NogsGateButton>
          </div>
        ) : null}
        {!inEditMode && !mobilePreview && !isMobile && isEditable && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-4 z-40">
            <Button
              onClick={() => setEditMode(true)}
              className="flex items-center rounded-xl p-2 bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
            >
              <FaPaintbrush className="mr-2" />
              Customize
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default TabBar;