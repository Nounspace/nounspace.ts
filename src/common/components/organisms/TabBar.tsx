import React from "react";
import { FaPlus } from "react-icons/fa6";
import { first, map } from "lodash";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { memo, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/common/data/stores/app";
import { Reorder, AnimatePresence } from "framer-motion";
import { Tab } from "../atoms/reorderable-tab";
import { useRouter } from "next/router";
import { SpaceLookupInfo } from "@/common/data/stores/app/space/spaceStore";
import NogsGateButton from "./NogsGateButton";

interface TabBarProps {
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
}

function TabBar({
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
}: TabBarProps) {
  function generateNewTabName() {
    const endIndex = tabList.length + 1;
    const base = `Tab ${endIndex}`;
    let newName = base;
    let iter = 1;

    while (tabList.includes(newName)) {
      newName = base + ` (${iter})`;
      iter += 1;
    }

    return newName;
  }

  async function handleCreateTab(tabName: string) {
    await updateTabOrder([...tabList, tabName]);
    await createTab(tabName);
    switchTabTo(tabName);
  }

  function handleDeleteTab(tabName: string) {
    switchTabTo(nextClosestTab(tabName));
    updateTabOrder(tabList.filter((name) => name !== tabName));
    deleteTab(tabName);
  }

  async function handleRenameTab(tabName: string, newName: string) {
    await renameTab(tabName, newName);
    await updateTabOrder(
      tabList.map((name) => (name === tabName ? newName : name)),
    );
    await commitTab(newName);
    await commitTabOrder();
    switchTabTo(newName);
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
      <Reorder.Group
        as="ol"
        axis="x"
        onReorder={updateTabOrder}
        className="flex flex-row gap-4 grow items-start m-4 tabs"
        values={tabList}
      >
        <AnimatePresence initial={false}>
          {map(
            inHomebase ? ["Feed", ...tabList] : tabList,
            (tabName: string) => {
              return (
                <Tab
                  key={tabName}
                  tabName={tabName}
                  inEditMode={inEditMode}
                  isSelected={currentTab === tabName}
                  onClick={() => switchTabTo(tabName)}
                  removeable={tabName !== "Feed"}
                  draggable={inEditMode}
                  renameable={tabName !== "Feed"}
                  onRemove={() => handleDeleteTab(tabName)}
                  renameTab={handleRenameTab}
                />
              );
            },
          )}
        </AnimatePresence>
      </Reorder.Group>

      {inEditMode ? (
        <div className="flex flex-row z-infinity">
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
