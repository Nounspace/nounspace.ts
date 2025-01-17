import React from "react";
import { FaPlus } from "react-icons/fa6";
import { map } from "lodash";
import { Reorder, AnimatePresence } from "framer-motion";
import { Tab } from "../atoms/reorderable-tab";
import NogsGateButton from "./NogsGateButton";
import { Address } from "viem";
import { Button } from "../atoms/button";
import { useAppStore } from "@/common/data/stores/app";
import Modal from "../molecules/Modal";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../atoms/tooltip";
import { useToken } from "@/common/providers/TokenProvider";
import TokenDataHeader from "./TokenDataHeader";

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
  const { setModalOpen, getIsLoggedIn, getIsInitializing } = useAppStore(
    (state) => ({
      setModalOpen: state.setup.setModalOpen,
      getIsLoggedIn: state.getIsAccountReady,
      getIsInitializing: state.getIsInitializing,
    }),
  );

  const [isModalOpen, setModalOpenState] = React.useState(false);
  const { tokenData } = useToken();

  const handleClaimClick = () => {
    setModalOpenState(true);
  };

  const handleModalClose = () => {
    setModalOpenState(false);
  };

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
        {isTokenPage && !getIsInitializing() && !isLoggedIn && (
          <div className="flex items-center mr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="line-clamp-1 min-w-40 max-w-xs truncate"
                  variant="primary"
                  color="primary"
                  onClick={handleClaimClick}
                >
                  Claim this Space
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Log in with the Farcaster account that deployed $
                {tokenData?.symbol} to customize this space.
              </TooltipContent>
            </Tooltip>
          </div>
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
        <Modal
          open={isModalOpen}
          setOpen={handleModalClose}
          title={`Claim ${tokenData?.symbol}'s Token Space`}
          description={`Login in with the Farcaster Account that deployed ${tokenData?.symbol} to customize this space.`}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full"
            src="/images/tutorial.webm"
          />
          <div className="flex flex-col items-center justify-center p-4">
            <Button
              className="line-clamp-1 min-w-40 max-w-xs truncate"
              variant="primary"
              color="primary"
              onClick={() => setModalOpen(true)}
            >
              Sign In
            </Button>
          </div>
        </Modal>
      </div>
    </TooltipProvider>
  );
}

export default TabBar;
