"use client";
import React from "react";
import { FaPlus } from "react-icons/fa6";
import { map } from "lodash";
import { Reorder, AnimatePresence } from "framer-motion";
import { Tab } from "../atoms/reorderable-tab";
import NogsGateButton from "./NogsGateButton";
import { Address } from "viem";
import { useAppStore } from "@/common/data/stores/app";
import { TooltipProvider } from "../atoms/tooltip";
import TokenDataHeader from "./TokenDataHeader";
import ClaimButtonWithModal from "../molecules/ClaimButtonWithModal";

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
  createTab: (tabName: string) => Promise<void>;
  renameTab: (tabName: string, newName: string) => void;
  commitTab: (tabName: string) => void;
  getSpacePageUrl: (tabName: string) => string;
  isTokenPage?: boolean;
  contractAddress?: Address;
  loadTabNames: () => Promise<string[]>;
}

const PERMANENT_TABS = ["Feed", "Profile"];
const isEditableTab = (tabName: string) => !PERMANENT_TABS.includes(tabName);

function TabBar({
  inHome,
  inHomebase,
  inEditMode,
  currentTab,
  tabList,
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
  loadTabNames,
}: TabBarProps) {
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
    let iter = 1;
    let uniqueName = tabName;
    while (tabList.includes(uniqueName)) {
      uniqueName = tabName + ` (${iter})`;
      iter += 1;
    }
    return uniqueName;
  }

  async function handleCreateTab(tabName: string) {
    await createTab(tabName);
    await commitTabOrder();
    switchTabTo(tabName);
  }

  async function handleDeleteTab(tabName: string) {
    // Get the next tab before any state changes
    const nextTab = nextClosestTab(tabName);
    
    try {
        // First update the tab order and delete the tab
        const newOrder = tabList.filter((name) => name !== tabName);
        updateTabOrder(newOrder);
        await deleteTab(tabName);
        await commitTabOrder();
        
        // Then navigate to the next tab
        requestAnimationFrame(() => {
            switchTabTo(nextTab, false);
        });
    } catch (error) {
        console.error("Failed to delete tab:", error);
        // Optionally add error handling UI here
    }
  }

  async function handleRenameTab(tabName: string, newName: string) {
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

  const isLoggedIn = getIsLoggedIn();

  return (
    <TooltipProvider>
      <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-50 bg-white">
        {isTokenPage && contractAddress && (
          <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-30 bg-white">
            <TokenDataHeader />
          </div>
        )}
        <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-70 bg-white">
          {tabList && (
            <Reorder.Group
              as="ol"
              axis="x"
              onReorder={updateTabOrder}
              className="flex flex-row gap-4 grow items-start m-4 tabs"
              values={tabList}
            >
              <AnimatePresence initial={false}>
                {map(
                  inHome
                    ? ["Welcome", ...tabList]
                    : inHomebase
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
                        onClick={() => {}}
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
        {isTokenPage && !getIsInitializing() && !isLoggedIn && (
          <ClaimButtonWithModal contractAddress={contractAddress} />
        )}
        {inEditMode ? (
          <div className="mr-36 flex flex-row z-infinity">
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
      </div>
    </TooltipProvider>
  );
}

export default TabBar;
