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
import useIsMobile from "@/common/lib/hooks/useIsMobile";

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
}

const PERMANENT_TABS = ["Feed", "Profile", "Welcome"];
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
}: TabBarProps) {
  const isMobile = useIsMobile();

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

  function handleDeleteTab(tabName: string) {
    switchTabTo(nextClosestTab(tabName), false);
    updateTabOrder(tabList.filter((name) => name !== tabName));
    deleteTab(tabName);
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
    const index = tabList.indexOf(tabName) - 1;
    if (index >= 0) {
      return tabList[index];
    } else if (inHomebase) {
      return "Feed";
    } else {
      return tabList[0];
    }
  }

  const isLoggedIn = getIsLoggedIn();

  return (
    <TooltipProvider>
      <div className="flex flex-col md:flex-row justify-start md:h-16 overflow-y-scroll w-full z-50 bg-white">
        {isTokenPage && contractAddress && (
          <div className="flex flex-row justify-start h-16 overflow-y-scroll w-full z-30 bg-white">
            <TokenDataHeader />
          </div>
        )}
        <div className="flex flex-row justify-start h-16 overflow-y-scroll w-full z-70 bg-white">
          {tabList && (
            <Reorder.Group
              as="ol"
              axis="x"
              onReorder={updateTabOrder}
              className="flex flex-row gap-5 md:gap-4 grow items-start m-4 tabs"
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
        {isTokenPage && !getIsInitializing() && !isLoggedIn && !isMobile && (
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
