import React from "react";
import { FaPlus } from "react-icons/fa6";
import { map } from "lodash";
import { Reorder, AnimatePresence } from "framer-motion";
import { Tab } from "../atoms/reorderable-tab";
import NogsGateButton from "./NogsGateButton";
import TokenTabBarHeader from "@/pages/t/base/[contractAddress]/TokenDataHeader";
import { Address } from "viem";

interface TabBarProps {
  inHome?: boolean;
  inHomebase: boolean;
  inEditMode: boolean;
  currentTab: string;
  tabList: string[];
  updateTabOrder: (newOrder: string[]) => void;
  commitTabOrder: () => void;
  switchTabTo: (tabName: string) => void;
  deleteTab: (tabName: string) => void;
  createTab: (tabName: string) => void;
  renameTab: (tabName: string, newName: string) => void;
  commitTab: (tabName: string) => void;
  getSpacePageUrl: (tabName: string) => string;
  isTokenPage?: boolean;
  contractAddress?: Address;
}

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
    switchTabTo(tabName);
  }

  function handleDeleteTab(tabName: string) {
    switchTabTo(nextClosestTab(tabName));
    updateTabOrder(tabList.filter((name) => name !== tabName));
    deleteTab(tabName);
  }

  async function handleRenameTab(tabName: string, newName: string) {
    const uniqueName = generateUniqueTabName(newName);

    await renameTab(tabName, uniqueName);
    await updateTabOrder(
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

  return (
    <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-50 bg-white">
      {isTokenPage && contractAddress && (
        <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-30 bg-white">
          <TokenTabBarHeader
            tokenImage={undefined}
            isPending={false}
            error={null}
            tokenName={undefined}
            tokenSymbol={undefined}
            contractAddress={contractAddress}
          />
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
                      removeable={
                        tabName !== "Feed" &&
                        tabName !== "Profile" &&
                        tabName !== "Welcome"
                      }
                      draggable={inEditMode}
                      renameable={
                        tabName !== "Feed" &&
                        tabName !== "Profile" &&
                        tabName !== "Welcome"
                      }
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
  );
}

export default TabBar;
