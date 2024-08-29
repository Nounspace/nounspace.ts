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
    loadTabNames: state.homebase.loadTabNames,
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

  const { localTabStore } = useAppStore((state) => ({
    localTabStore: state.homebase.tabOrdering.local,
  }));
  const [hasFetchedTabs, setHasFetchedTabs] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");
  const [profileFID, setProfileFID] = useState(0);
  const urlPieces = router.asPath.split("/");

  function updateCurrentSelection() {
    const pathEnd = decodeURI(urlPieces[urlPieces.length - 1]);

    if (pathEnd === "homebase") {
      setSelectedTab("Feed");
    } else {
      setSelectedTab(pathEnd);
    }
  }

  function selectNewTab(tabName: string) {
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
    // Prevent work from being lost
    if (
      inEditMode &&
      (localTabStore.includes(selectedTab) || selectedTab === "Feed")
    ) {
      commitTab(selectedTab);
    }

    selectNewTab(tabName);
  }

  async function getProfileFID() {
    const username = decodeURI(urlPieces[urlPieces.length - 2]);

    try {
      const {
        result: { user },
      } = await neynar.lookupUserByUsername(username);
      setProfileFID(user.fid);
      return user.fid;
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
        // Check actual files
        const namesList = await loadTabNames();

        if (namesList.length !== 0) {
          let remoteTabNames = await loadTabOrdering();

          // Cross reference
          remoteTabNames = remoteTabNames.filter((x) => namesList.includes(x));
          const remainder = namesList.filter(
            (x) => !remoteTabNames.includes(x),
          );
          updateTabOrdering(remoteTabNames.concat(remainder));
        }
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
      updateCurrentSelection();

      // Prefetch all the tabs
      localTabStore.forEach((tabName: string) => {
        const href = hasProfile
          ? `/s/${username}/${tabName}`
          : tabName == "Feed"
            ? `/homebase`
            : `/homebase/${tabName}`;

        router.prefetch(href);
      });
    }
  }, []);

  async function commitTab(tabName: string) {
    if (inEditMode) {
      if (hasProfile) {
        // Load the space ordering
        const freshSpaceOrdering = await loadSpaceOrdering(profileFID);
        // Find the associated spaceId
        const currentSpaceID = freshSpaceOrdering.find(
          (x) => x.name === tabName,
        );
        commitSpaceToDatabase(currentSpaceID!.spaceId);
      } else {
        if (tabName == "Feed") {
          commitHomebaseToDatabase();
        } else {
          commitTabToDatabase(tabName);
        }
      }
    }
  }

  async function pushNewTabOrdering(newTabOrder: string[]) {
    if (inEditMode) {
      if (hasProfile) {
        // Generate new spaceLookupInfo array
        const spaceLookups = await loadSpaceOrdering(profileFID);
        const newSpaceOrdering = [] as SpaceLookupInfo[];
        newTabOrder.forEach((tab) => {
          const currSpaceLookup = spaceLookups.filter((obj) => {
            return obj.name === tab;
          });
          newSpaceOrdering.concat(currSpaceLookup);
        });

        // Save locally then commit
        await updateSpaceOrdering(profileFID, newSpaceOrdering);
        commitSpaceOrdering(profileFID);
      } else {
        await updateTabOrdering(newTabOrder);
        commitTabOrdering();
      }
    }
  }

  function generateTabName() {
    const base = `Tab ${localTabStore.length + 1}`;
    let newName = base;
    let iter = 1;

    while (localTabStore.includes(newName)) {
      newName = base + ` (${iter})`;
      iter += 1;
    }

    return newName;
  }

  function nextClosestTab(tabName: string) {
    const index = localTabStore.indexOf(tabName) - 1;
    if (index >= 0) {
      return localTabStore[index];
    } else {
      return "Feed";
    }
  }

  async function renameAndReload(tabName: string, newTabName: string) {
    if (inEditMode) {
      await commitTab(tabName);

      if (hasProfile) {
        const spaceLookups = await loadSpaceOrdering(profileFID);
        const currSpaceLookup = spaceLookups.find((obj) => {
          return obj.name === tabName;
        });
        await renameSpace(currSpaceLookup!.spaceId, newTabName);
      } else {
        await renameTab(tabName, newTabName);
      }

      const newTabNames = localTabStore.map((currTab) =>
        currTab == tabName ? newTabName : currTab,
      );

      pushNewTabOrdering(newTabNames);
      switchTab(newTabName);
    }
  }

  function handleDeleteTab(tabName: string) {
    if (inEditMode) {
      selectNewTab(nextClosestTab(tabName));

      const newTabNames = localTabStore.filter((n) => n != tabName);
      pushNewTabOrdering(newTabNames);

      if (hasProfile) {
        //TODO
      } else {
        deleteTab(tabName);
      }
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

      const newTabNames = localTabStore.concat(newTabName);
      pushNewTabOrdering(newTabNames);
      switchTab(newTabName);
    }
  }

  return (
    <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-50 bg-white">
      <Reorder.Group
        as="ol"
        axis="x"
        onReorder={updateTabOrdering}
        className="flex flex-row gap-4 grow items-start m-4 tabs"
        values={localTabStore}
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
          {map(localTabStore, (tabName: string) => {
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
