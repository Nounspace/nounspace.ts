import { mergeClasses as cn } from "@/common/lib/utils/mergeClasses";
import TokenTabBarHeader from "@/pages/t/base/[contractAddress]/TokenDataHeader";
import { useState } from "react";
import { IconType } from "react-icons";
import { BsBarChartFill } from "react-icons/bs";
import { FaLink } from "react-icons/fa6";
import { IoIosChatboxes } from "react-icons/io";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { SiFarcaster } from "react-icons/si";
import { Address } from "viem";

type Pages = "Price" | "Swaps" | "Chat" | "Links" | "Feed";

export const MobileContractDefinedSpace = ({
  contractAddress,
}: {
  contractAddress: string;
}) => {
  const [tab, setTab] = useState<Pages>("Price");

  const IconButton = ({
    icon: Icon,
    label,
    currentTab,
    size,
  }: {
    icon: IconType;
    label: Pages;
    currentTab: Pages;
    size: number;
  }) => (
    <div
      onClick={() => setTab(label)}
      className={cn(
        "gap-1 text-sm font-semibold flex flex-col items-center cursor-pointer",
        currentTab === label && "text-purple-500",
      )}
    >
      <Icon size={size} /> {label}
    </div>
  );

  return (
    <div className="h-[100dvh] w-full flex flex-col">
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
      <div className="flex-1 p-4">
        {tab === "Price" && <div>Price</div>}
        {tab === "Swaps" && <div>Swaps</div>}
        {tab === "Chat" && <div>Chat</div>}
        {tab === "Links" && <div>Links</div>}
        {tab === "Feed" && <div>Feed</div>}
      </div>
      <div className="flex items-end justify-around w-full py-2 border-t border-t-gray-200">
        <IconButton
          size={20}
          icon={BsBarChartFill}
          label="Price"
          currentTab={tab}
        />
        <IconButton
          size={26}
          icon={MdOutlineSwapHoriz}
          label="Swaps"
          currentTab={tab}
        />
        <IconButton
          size={20}
          icon={IoIosChatboxes}
          label="Chat"
          currentTab={tab}
        />
        <IconButton size={20} icon={FaLink} label="Links" currentTab={tab} />
        <IconButton
          size={20}
          icon={SiFarcaster}
          label="Feed"
          currentTab={tab}
        />
      </div>
    </div>
  );
};
