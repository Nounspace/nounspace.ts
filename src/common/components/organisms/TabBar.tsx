import AddFidgetIcon from "@/common/components/atoms/icons/AddFidget";
import { FaPlus, FaX } from "react-icons/fa6";
import { first, map } from "lodash";
import Link from "next/link";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { memo, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/common/data/stores/app";
import EditableText from "../atoms/editable-text";
import { Button } from "../atoms/button";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Tab } from "../atoms/reorderable-tab";
import { useRouter } from "next/router";

interface TabBarProps {
  hasProfile: boolean;
  inEditMode: boolean;
  openFidgetPicker: () => void;
}

const TabBar = memo(function TabBar({
  hasProfile,
  inEditMode,
  openFidgetPicker,
}: TabBarProps) {
  const { fid } = useFarcasterSigner("navigation");
  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);
  const username = useMemo(() => user?.username, [user]);
  const router = useRouter();

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

  const [tabNames, setTabNames] = useState<string[]>([]);
  const [hasFetchedTabs, setHasFetchedTabs] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");

  function setCurrentlySelectedTab() {
    const parts = router.asPath.split("/");
    const pathEnd = decodeURI(parts[parts.length - 1]);

    console.log(pathEnd);

    if (pathEnd === "homebase") {
      setSelectedTab("Feed");
    } else {
      setSelectedTab(pathEnd);
    }
  }

  function selectTab(tabName: string) {
    if (tabName != selectedTab) {
      var href = hasProfile
        ? `/s/${username}/${tabName}`
        : tabName == "Feed"
          ? `/homebase`
          : `/homebase/${tabName}`;
      // router.push(href);
      setSelectedTab(tabName);
    }
  }

  async function getTabNames() {
    try {
      const freshTabNames = await loadTabOrdering();

      setHasFetchedTabs(true);
      setTabNames(freshTabNames);
      setCurrentlySelectedTab();
    } catch (e) {
      console.log("Hit an error: ", e);
    }
  }

  function updateTabs(tabs: string[]) {
    setTabNames(tabs);
    updateTabOrdering(tabs);
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

  useEffect(() => {
    if (tabNames.length == 0) {
      if (!hasFetchedTabs) {
        getTabNames();
      }
    }
  });

  return (
    <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full">
      <Reorder.Group
        as="ol"
        axis="x"
        onReorder={updateTabs}
        className="flex flex-row gap-4 grow items-start m-4 tabs"
        values={tabNames}
      >
        <AnimatePresence initial={false}>
          {!hasProfile && (
            <Tab
              key="Feed"
              tabName={"Feed"}
              inEditMode={inEditMode}
              isSelected={selectedTab === "Feed"}
              onClick={() => selectTab("Feed")}
              removeable={false}
              draggable={false}
              renameable={false}
            />
          )}
          {map(tabNames, (tabName: string) => {
            return (
              <Tab
                key={tabName}
                tabName={tabName}
                inEditMode={inEditMode}
                isSelected={selectedTab === tabName}
                onClick={() => selectTab(tabName)}
                removeable={true}
                draggable={inEditMode}
                renameable={true}
                onRemove={async () => {
                  await deleteTab(tabName);
                  getTabNames();
                }}
                renameTab={renameTab}
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
              selectTab(newTabName);
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
});

export default TabBar;
