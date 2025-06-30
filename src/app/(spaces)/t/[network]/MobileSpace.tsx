import React, { useEffect, useMemo, useState } from "react";
import Loading from "@/common/components/molecules/Loading";
import { useGetCastsByKeyword } from "@/common/data/queries/farcaster";
import { mergeClasses as cn } from "@/common/lib/utils/mergeClasses";
import { CastRow } from "@/fidgets/farcaster/components/CastRow";
import { isNil } from "lodash";
import { IconType } from "react-icons";
import { BsBarChartFill } from "react-icons/bs";
import { FaLink } from "react-icons/fa6";
import { IoIosChatboxes } from "react-icons/io";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { SiFarcaster } from "react-icons/si";
import { useInView } from "react-intersection-observer";
import { useToken } from "@/common/providers/TokenProvider";
import TokenDataHeader from "../../../../common/components/organisms/TokenDataHeader";
import {
  getGeckoUrl,
  getMatchaUrl,
  getGeckoIframe,
} from "@/common/lib/utils/links";
import { Address } from "viem";
import { EtherScanChainName } from "@/constants/etherscanChainIds";
import { useAppStore } from "@/common/data/stores/app";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";

type Pages = "Price" | "Swaps" | "Chat" | "Links" | "Feed";

export const MobileContractDefinedSpace = ({
  contractAddress,
  tabName: providedTabName,
}: {
  contractAddress: string;
  tabName: string;
}) => {
  const [tab, setTab] = useState<Pages>("Price");
  const [ref, inView] = useInView();
  const { tokenData } = useToken();
  const symbol =
    tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "";
  const decimals = tokenData?.geckoData?.decimals || "";
  const image =
    tokenData?.clankerData?.img_url ||
    (tokenData?.geckoData?.image_url !== "missing.png"
      ? tokenData?.geckoData?.image_url
      : null);

  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitialContractSpaceConfigForAddress(
        contractAddress,
        tokenData?.clankerData?.cast_hash || "",
        tokenData?.clankerData?.requestor_fid
          ? String(tokenData.clankerData.requestor_fid)
          : "",
        tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "",
        !!tokenData?.clankerData,
        tokenData?.network
      ),
    [contractAddress, tokenData, tokenData?.network]
  );

  const { getCurrentSpaceConfig } = useAppStore((state) => ({
    getCurrentSpaceConfig: state.currentSpace.getCurrentSpaceConfig,
  }));
  const currentConfig = getCurrentSpaceConfig();
  const config = {
    ...(currentConfig?.tabs[providedTabName]
      ? currentConfig.tabs[providedTabName]
      : INITIAL_SPACE_CONFIG),
    isEditable: false,
  };

  const memoizedConfig = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ...restConfig } = config;
    return restConfig;
  }, [
    config.fidgetInstanceDatums,
    config.layoutID,
    config.layoutDetails,
    config.fidgetTrayContents,
    config.theme,
  ]);

  console.log("memoizedConfig", memoizedConfig);

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    isPending,
  } = useGetCastsByKeyword({
    keyword: tokenData ? `$${symbol}` : "",
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

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
        currentTab === label && "text-purple-500"
      )}
    >
      <Icon size={size} /> {label}
    </div>
  );

  const LinkItem = ({
    href,
    imgSrc,
    alt,
    label,
  }: {
    href: string;
    imgSrc: string;
    alt: string;
    label: string;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center p-2 rounded-md bg-gray-100 font-medium text-lg"
    >
      <img src={imgSrc} alt={alt} className="w-8 h-8 mr-3" />
      <span>{label}</span>
    </a>
  );

  const handleAddToMetamask = async () => {
    try {
      await (window as any).ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: contractAddress,
            symbol,
            decimals,
            image,
          },
        },
      });

      // console.log("Token added to MetaMask");
    } catch (error) {
      alert(`Error adding token to MetaMask: ${error}`);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex flex-shrink-1 flex-row justify-center h-16 w-full z-30 bg-white">
        <TokenDataHeader />
      </div>
      <div className="flex-1">
        <div
          className={cn(
            "w-full h-full overflow-hidden",
            tab !== "Price" && "hidden"
          )}
        >
          <iframe
            src={getGeckoIframe(
              contractAddress as Address,
              tokenData?.network as EtherScanChainName
            )}
            title="Market Data"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="size-full"
          />
        </div>
        <div
          className={cn(
            "w-full h-full overflow-hidden",
            tab !== "Swaps" && "hidden"
          )}
        >
          <iframe
            src={getMatchaUrl(
              contractAddress as Address,
              tokenData?.network as EtherScanChainName
            )}
            title="Swap Fidget"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="size-full"
          />
        </div>
        <div
          className={cn(
            "w-full h-full overflow-hidden",
            tab !== "Chat" && "hidden"
          )}
        >
          <iframe
            src={`https://chat-fidget.vercel.app/?room=${contractAddress}&viewport=mobile`}
            title="Chat Widget"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="size-full"
          />
        </div>
        <div
          className={cn("flex flex-col gap-3 p-3", tab !== "Links" && "hidden")}
        >
          {tokenData?.clankerData?.cast_hash && (
            <LinkItem
              href={`https://www.clanker.world/clanker/${contractAddress}`}
              imgSrc="https://www.clanker.world/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FBXluQx4ige9GuW0Ia56BHw%2F295953fa-15ed-4d3c-241d-b6c1758c6200%2Foriginal&w=256&q=75"
              alt="Clanker.world"
              label="Clanker.world"
            />
          )}
          <LinkItem
            href={getGeckoUrl(
              contractAddress as Address,
              tokenData?.network as EtherScanChainName
            )}
            imgSrc="https://www.geckoterminal.com/_next/image?url=https%3A%2F%2Fs.geckoterminal.com%2F_next%2Fstatic%2Fmedia%2Flogo_icon.845c1574.png&w=64&q=75"
            alt="CoinGecko"
            label="CoinGecko"
          />
          <LinkItem
            href={`https://${tokenData?.network}scan.org/address/${contractAddress}`} //lol
            imgSrc="https://etherscan.io/images/brandassets/etherscan-logo-circle.svg"
            alt="BaseScan"
            label="BaseScan"
          />
          <div
            onClick={handleAddToMetamask}
            className="flex items-center justify-center p-2 rounded-md bg-gray-100 font-medium text-lg"
          >
            <img
              src="https://logosarchive.com/wp-content/uploads/2022/02/Metamask-icon.svg"
              alt="metamask"
              style={{ width: "32px", height: "32px" }}
              className={"mr-3"}
            />
            <span>Add to Metamask</span>
          </div>
        </div>
        <div className={cn(tab !== "Feed" && "hidden")}>
          <>
            {!isPending && (
              <div>
                {isError ? (
                  <div>Error</div>
                ) : !isNil(data) ? (
                  data.pages.map((page, pageNum) => (
                    <React.Fragment key={pageNum}>
                      {page.result.casts?.map((cast, index) => (
                        <CastRow cast={cast} key={index} />
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  <div>No casts found with these filter settings</div>
                )}
              </div>
            )}
            {!isError && (
              <div ref={ref} className="h-3/6">
                {isFetchingNextPage ? (
                  <div className="h-full w-full bg-[#E6E6E6] flex flex-col justify-center items-center">
                    <Loading />
                  </div>
                ) : hasNextPage ? (
                  "Fetch More Data"
                ) : null}
              </div>
            )}
          </>
        </div>
      </div>
      <div
        className="flex flex-shrink-1 items-end justify-around w-full py-2 border-t border-t-gray-200"
        style={{ touchAction: "manipulation" }}
      >
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
