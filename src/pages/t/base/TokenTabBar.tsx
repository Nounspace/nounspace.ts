import React from "react";
import { FaPlus } from "react-icons/fa6";
import { map } from "lodash";
import { Reorder, AnimatePresence } from "framer-motion";
import NogsGateButton from "@/common/components/organisms/NogsGateButton";
import { Tab } from "@/common/components/atoms/reorderable-tab";
import { useReadContract } from "wagmi";
import tokensABI from "@/contracts/tokensABI";
import TokenTabBarHeader from "./TokenTabBarHeader";

interface TabBarProps {
  inEditMode: boolean;
  currentTab: string;
  tabList: string[];
  contractAddress: `0x${string}`;
  updateTabOrder: (newOrder: string[]) => void;
  commitTabOrder: () => void;
  switchTabTo: (tabName: string) => void;
  deleteTab: (tabName: string) => void;
  createTab: (tabName: string) => void;
  renameTab: (tabName: string, newName: string) => void;
  commitTab: (tabName: string) => void;
  getSpacePageUrl: (tabName: string) => string;
}

function TokenTabBar({
  inEditMode,
  currentTab,
  tabList,
  contractAddress,
  switchTabTo,
  updateTabOrder,
  commitTabOrder,
  deleteTab,
  createTab,
  renameTab,
  commitTab,
  getSpacePageUrl,
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
    return index >= 0 ? tabList[index] : tabList[0];
  }

  const wagmiContractConfig = {
    address: contractAddress as `0x${string}`,
    abi: tokensABI,
  };

  const {
    data: tokenImage,
    error: imageError,
    isPending: isImagePending,
  } = useReadContract<typeof tokensABI, "image", []>({
    ...wagmiContractConfig,
    functionName: "image",
  });

  const {
    data: tokenName,
    error: nameError,
    isPending: isNamePending,
  } = useReadContract<typeof tokensABI, "name", []>({
    ...wagmiContractConfig,
    functionName: "name",
  });

  const {
    data: tokenSymbol,
    error: symbolError,
    isPending: isSymbolPending,
  } = useReadContract<typeof tokensABI, "symbol", []>({
    ...wagmiContractConfig,
    functionName: "symbol",
  });

  return (
    <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-50 bg-white">
      <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-40 bg-white">
        <TokenTabBarHeader
          tokenImage={tokenImage as string | undefined}
          isPending={isImagePending || isNamePending || isSymbolPending}
          error={imageError || nameError || (symbolError as Error | null)}
          tokenName={tokenName as string | undefined}
          tokenSymbol={tokenSymbol as string | undefined}
          contractAddress={contractAddress}
        />
      </div>
      <div className="w-0.5 h-16 bg-gray-200 m-2" />
      <div className="flex flex-row justify-center h-16 overflow-y-scroll w-full z-60 bg-white">
        {tabList && (
          <Reorder.Group
            as="ol"
            axis="x"
            onReorder={updateTabOrder}
            className="flex flex-row gap-4 grow items-start m-4 tabs"
            values={tabList}
          >
            <AnimatePresence initial={false}>
              {map(tabList, (tabName: string) => (
                <Tab
                  key={tabName}
                  getSpacePageUrl={getSpacePageUrl}
                  tabName={tabName}
                  inEditMode={inEditMode}
                  isSelected={currentTab === tabName}
                  onClick={() => {}}
                  removeable={tabName !== "Profile"}
                  draggable={inEditMode}
                  renameable={tabName !== "Profile"}
                  onRemove={() => handleDeleteTab(tabName)}
                  renameTab={handleRenameTab}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
      {inEditMode && (
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
      )}
    </div>
  );
}

export default TokenTabBar;
