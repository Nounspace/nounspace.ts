import AddFidgetIcon from "@/common/components/atoms/icons/AddFidget";
import { FaPlus, FaX } from "react-icons/fa6";
import { first, map } from "lodash";
import Link from "next/link";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/common/data/stores/app";
import EditableText from "../atoms/editable-text";
import { Button } from "../atoms/button";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Tab } from "../atoms/reorderable-tab";

const TabBar = ({ hasProfile, inEditMode, openFidgetPicker }) => {
  const { fid } = useFarcasterSigner("navigation");
  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);
  const username = useMemo(() => user?.username, [user]);

  const {
    loadTabOrdering,
    updateTabOrdering,
    createTab,
    deleteTab,
    renameTab,
  } = hasProfile
    ? useAppStore((state) => ({
        loadTabOrdering: state.homebase.loadTabNames,
        updateTabOrdering: state.homebase.updateTabOrdering,
        createTab: state.homebase.createTab,
        deleteTab: state.homebase.deleteTab,
        renameTab: state.homebase.renameTab,
      }))
    : useAppStore((state) => ({
        loadTabOrdering: state.homebase.loadTabNames,
        updateTabOrdering: state.homebase.updateTabOrdering,
        createTab: state.homebase.createTab,
        deleteTab: state.homebase.deleteTab,
        renameTab: state.homebase.renameTab,
      }));

  const [tabNames, setTabNames] = useState([""]);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [selectedTab, setSelectedTab] = useState(tabNames[0]);

  async function getTabs() {
    try {
      setLoadingTabs(true);
      const freshTabNames = await loadTabOrdering();
      setTabNames(freshTabNames);
      setLoadingTabs(false);
    } catch (e) {
      console.log("Hit an error: ", e);
    }
  }

  function generateTabName() {
    const base = `Tab ${tabNames.length + 1}`;
    var newName = base;
    var iter = 1;

    while (tabNames.includes(newName)) {
      newName = base + ` (${iter})`;
      iter += 1;
    }

    return newName;
  }

  function setTabs(tabs: string[]) {
    setTabNames(tabs);
    updateTabOrdering(tabs);
  }

  useEffect(() => {
    if (loadingTabs) {
      getTabs();
    }
  });

  return (
    <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full">
      <Reorder.Group
        as="ol"
        axis="x"
        onReorder={setTabs}
        className="flex flex-row gap-4 grow items-start m-4 tabs"
        values={tabNames}
      >
        <AnimatePresence initial={false}>
          {!hasProfile && (
            <Tab
              key="feed"
              tabName={"Feed"}
              inEditMode={inEditMode}
              isSelected={selectedTab === "Feed"}
              onClick={() => setSelectedTab("Feed")}
              removeable={false}
              draggable={false}
            />
          )}
          {map(tabNames, (tabName: string) => {
            return (
              <Tab
                key={tabName}
                tabName={tabName}
                inEditMode={inEditMode}
                isSelected={selectedTab === tabName}
                onClick={() => setSelectedTab(tabName)}
                removeable={true}
                draggable={true}
                onRemove={() => {
                  deleteTab(tabName);
                  getTabs();
                }}
              />
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {inEditMode ? (
        <div className="flex flex-row">
          <button
            onClick={() => {
              const newTabName = generateTabName();
              createTab(newTabName);
              setTabNames(tabNames.concat(newTabName));
            }}
            className="items-center flex rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
          >
            <div className="ml-2">
              <FaPlus />
            </div>
            <span className="ml-4 mr-2">Tab</span>
          </button>

          <button
            onClick={openFidgetPicker}
            className="flex rounded-xl p-2 m-3 px-auto bg-[#F3F4F6] hover:bg-sky-100 text-[#1C64F2] font-semibold"
          >
            <div className="ml-2">
              <AddFidgetIcon />
            </div>
            <span className="ml-4 mr-2">Fidget</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default TabBar;
