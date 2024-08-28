import React from "react";
import AddFidgetIcon from "@/common/components/atoms/icons/AddFidget";
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
import { stat } from "fs";
import { getFidForAddress, getUsernameForFid } from "@/fidgets/farcaster/utils";
import neynar from "@/common/data/api/neynar";

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
    loadTabNames,
    loadTabOrdering,
    loadSpaceOrdering,
    updateTabOrdering,
    updateSpaceOrdering,
    commitTabOrdering,
    commitSpaceOrdering,
    commitTabToDatabase,
    commitSpaceToDatabase,
    commitHomebaseToDatabase,
    createTab,
    createSpace,
    deleteTab,
    deleteSpace,
    renameTab,
    renameSpace,
  } = useAppStore((state) => ({
    commitHomebaseToDatabase: state.homebase.commitHomebaseToDatabase,
    commitTabToDatabase: state.homebase.commitHomebaseTabToDatabase,
    commitSpaceToDatabase: state.space.commitSpaceToDatabase,
    loadTabNames: state.homebase.loadTabOrdering,
    loadTabOrdering: state.homebase.loadTabOrdering,
    loadSpaceOrdering: state.space.loadSpaceOrderForFid,
    updateTabOrdering: state.homebase.updateTabOrdering,
    updateSpaceOrdering: state.space.updateLocalSpaceOrdering,
    commitTabOrdering: state.homebase.commitTabOrderingToDatabase,
    commitSpaceOrdering: state.space.commitSpaceOrderToDatabase,
    createTab: state.homebase.createTab,
    createSpace: state.space.registerSpace,
    deleteTab: state.homebase.deleteTab,
    deleteSpace: state.space.clear,
    renameTab: state.homebase.renameTab,
    renameSpace: state.space.renameSpace,
  }));

  const [tabNames, setTabNames] = useState<string[]>([]);
  const [hasFetchedTabs, setHasFetchedTabs] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");
  const [profileFID, setProfileFID] = useState(0);
  const urlPieces = router.asPath.split("/");

  function setCurrentlySelectedTab() {
    const pathEnd = decodeURI(urlPieces[urlPieces.length - 1]);

    if (pathEnd === "homebase") {
      setSelectedTab("Feed");
    } else {
      setSelectedTab(pathEnd);
    }
  }

  function selectTab(tabName: string) {
    if (tabName != selectedTab) {
      const href = hasProfile
        ? `/s/${username}/${tabName}`
        : tabName == "Feed"
          ? `/homebase`
          : `/homebase/${tabName}`;
      router.push(href);
      setSelectedTab(tabName);
    }
  }

  function switchTab(tabName: string) {
    commitTab(selectedTab);
    selectTab(tabName);
  }

  async function getProfileFID() {
    const username = decodeURI(urlPieces[urlPieces.length - 2]);

    try {
      const {
        result: { user },
      } = await neynar.lookupUserByUsername(username);
      setProfileFID(user.fid);
    } catch (e) {
      console.log("Hit an error: ", e);
    }
  }

  async function getTabNames() {
    try {
      setHasFetchedTabs(false);
      if (hasProfile) {
        // Make sure we have an FID for the profile
        if (profileFID === 0) {
          await getProfileFID();
        }

        // Load the space ordering
        const freshSpaceOrdering = await loadSpaceOrdering(profileFID!);

        // Convert it to strings
        setTabNames(
          freshSpaceOrdering.map((space: SpaceLookupInfo) => {
            space.name;
          }) as unknown as string[],
        );
      } else {
        let freshTabNames = await loadTabOrdering();

        // Compare to actual files
        const namesList = await loadTabNames();
        freshTabNames = freshTabNames.filter((x) => namesList.includes(x));
        setTabNames(freshTabNames);
        handleUpdateTabOrdering(namesList);
      }
      setHasFetchedTabs(true);
    } catch (e) {
      console.log("Hit an error: ", e);
    }
  }

  // Initial variables load
  useEffect(() => {
    if (hasProfile) {
      getProfileFID();
    }

    if (!hasFetchedTabs) {
      getTabNames();
      setCurrentlySelectedTab();

      // Prefetch all the tabs
      tabNames.forEach((tabName: string) => {
        const href = hasProfile
          ? `/s/${username}/${tabName}`
          : tabName == "Feed"
            ? `/homebase`
            : `/homebase/${tabName}`;

        router.prefetch(href);
      });
    }
  }, []);

  function commitTab(tabName: string) {
    if (inEditMode) {
      if (hasProfile) {
        commitSpaceToDatabase(tabName);
      } else {
        if (tabName != "Feed") {
          commitTabToDatabase(tabName);
        } else {
          commitHomebaseToDatabase();
        }
      }
    }
  }

  async function handleUpdateTabOrdering(tabs: string[]) {
    if (hasProfile) {
      // Generate new spaceLookupInfo array
      const spaceLookups = await loadSpaceOrdering(profileFID);
      let newSpaceOrdering = [] as SpaceLookupInfo[];
      tabs.forEach((tab) => {
        const currSpaceLookup = spaceLookups.filter((obj) => {
          return obj.name === tab;
        });
        newSpaceOrdering.concat(currSpaceLookup);
      });

      // Save locally then commit
      await updateSpaceOrdering(profileFID, newSpaceOrdering);
      commitSpaceOrdering(profileFID);
    } else {
      await updateTabOrdering(tabs);
      commitTabOrdering();
      setTabNames(tabs);
    }
  }

  function generateTabName() {
    const base = `Tab ${tabNames.length + 1}`;
    let newName = base;
    let iter = 1;

    while (tabNames.includes(newName)) {
      newName = base + ` (${iter})`;
      iter += 1;
    }

    return newName;
  }

  function nextClosestTab(tabName: string) {
    const index = tabNames.indexOf(tabName) - 1;
    if (index >= 0) {
      return tabNames[index];
    } else {
      return "Feed";
    }
  }

  async function renameAndReload(tabName: string, newTabName: string) {
    await commitTab(tabName);

    if (hasProfile) {
      const spaceLookups = await loadSpaceOrdering(profileFID);
      const currSpaceLookup = spaceLookups.find((obj) => {
        return obj.name === tabName;
      });
      renameSpace(currSpaceLookup!.spaceId, newTabName);
    } else {
      renameTab(tabName, newTabName);
    }

    const newTabNames = tabNames.map((currTab) =>
      currTab == tabName ? newTabName : currTab,
    );

    await handleUpdateTabOrdering(newTabNames);
    setTabNames(newTabNames);
    selectTab(newTabName);
  }

  function handleDeleteTab(tabName: string) {
    selectTab(nextClosestTab(tabName));

    const newTabNames = tabNames.filter((n) => n != tabName);
    setTabNames(newTabNames);
    handleUpdateTabOrdering(newTabNames);

    if (hasProfile) {
      //
    } else {
      deleteTab(tabName);
    }
  }

  async function handleCreateTab() {
    if (inEditMode) {
      const newTabName = generateTabName();

      if (hasProfile) {
        createSpace(profileFID, newTabName);
      } else {
        createTab(newTabName);
      }

      const newTabNames = tabNames.concat(newTabName);

      commitTab(newTabName);
      await handleUpdateTabOrdering(newTabNames);
      switchTab(newTabName);
    }
  }

  return (
    <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-50 bg-white">
      <Reorder.Group
        as="ol"
        axis="x"
        onReorder={handleUpdateTabOrdering}
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
              onClick={() => switchTab("Feed")}
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
                onClick={() => switchTab(tabName)}
                removeable={true}
                draggable={inEditMode}
                renameable={true}
                onRemove={() => handleDeleteTab(tabName)}
                renameTab={renameAndReload}
              />
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {inEditMode ? (
        <div className="flex flex-row">
          <button
            onClick={handleCreateTab}
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
