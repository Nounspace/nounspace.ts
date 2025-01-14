import Loading from "@/common/components/molecules/Loading";
import { useGetCastsByKeyword } from "@/common/data/queries/farcaster"; // Import new hook
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { mergeClasses as cn } from "@/common/lib/utils/mergeClasses";
import { CastRow } from "@/fidgets/farcaster/components/CastRow";
import TokenTabBarHeader from "@/pages/t/base/[contractAddress]/TokenDataHeader";
import { isNil } from "lodash";
import React, { useEffect, useState } from "react";
import { IconType } from "react-icons";
import { BsBarChartFill } from "react-icons/bs";
import { FaLink } from "react-icons/fa6";
import { IoIosChatboxes } from "react-icons/io";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { SiFarcaster } from "react-icons/si";
import { useInView } from "react-intersection-observer";

type Pages = "Price" | "Swaps" | "Chat" | "Links" | "Feed";
type TokenData = {
  price: string | null;
  image: string | null;
  marketCap: string | null;
  priceChange: string | null;
  tokenName: string | null;
  tokenSymbol: string | null;
  decimals: number | null;
};

export const MobileContractDefinedSpace = ({
  contractAddress,
}: {
  contractAddress: string;
}) => {
  const [tab, setTab] = useState<Pages>("Price");
  const [ref, inView] = useInView();
  const [tokenData, setTokenData] = useState<TokenData>();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchTokenData(contractAddress, null);
      setTokenData(res);
    };
    fetchData();
  }, []);

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    isPending,
  } = useGetCastsByKeyword({
    keyword: tokenData ? `$${tokenData.tokenSymbol}` : "",
  });

  useEffect(() => {
    console.log({ inView, hasNextPage });
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
        currentTab === label && "text-purple-500",
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
      const wasAdded = await (window as any).ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: contractAddress,
            symbol: tokenData?.tokenSymbol,
            decimals: tokenData?.decimals,
            image: tokenData?.image,
          },
        },
      });

      if (wasAdded) {
        console.log("Token added to MetaMask");
      } else {
        console.log("Token not added");
      }
    } catch (error) {
      alert(`Error adding token to MetaMask: ${error}`);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col">
      <div className="flex flex-row justify-center h-16 w-full z-30 bg-white">
        <TokenTabBarHeader
          tokenImage={undefined}
          isPending={false}
          error={null}
          tokenName={undefined}
          tokenSymbol={undefined}
          contractAddress={contractAddress}
        />
      </div>
      <div className="flex-1 overflow-y-scroll">
        <div
          className={cn(
            "w-full h-full overflow-hidden",
            tab !== "Price" && "hidden",
          )}
        >
          <iframe
            src={`https://www.geckoterminal.com/base/pools/${contractAddress}?embed=1&info=0&swaps=0&grayscale=0&light_chart=1`}
            title="Market Data"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="size-full"
          />
        </div>
        <div
          className={cn(
            "w-full h-full overflow-hidden",
            tab !== "Swaps" && "hidden",
          )}
        >
          <iframe
            src={`https://matcha.xyz/trade?sellAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&buyAddress=${contractAddress}&sellChain=base&buyChain=base`}
            title="Swap Fidget"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="size-full"
          />
        </div>
        <div
          className={cn(
            "w-full h-full overflow-hidden",
            tab !== "Chat" && "hidden",
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
          <LinkItem
            href={`https://www.clanker.world/clanker/${contractAddress}`}
            imgSrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAM1BMVEX////q5PfUxe7o4fbMu+uPadTGs+jKueqJYNHEseiJYtKOZ9PJt+rUx+7MuuvPwOvm3vVnLuiEAAAAXUlEQVR4Ac3QAxaAQAAE0LXR/S+bXdNDWuOvSSGBMsYhCikVRG2MxejcFZoHcXoDQCF9gBiMURC1cfYzpDFSiEnKAHF6w4TuiMscs0bt+69JQyW8VyvkOVeH6p/QAF54BSckEkJ8AAAAAElFTkSuQmCC"
            alt="Clanker.world"
            label="Clanker.world"
          />
          <LinkItem
            href={`https://dexscreener.com/base/${contractAddress}`}
            imgSrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAAA/ElEQVR4AY3NIYyCYBiH8adv9tuM168ni9FCvmifhchoBIKFZN/sgY1KMxBtNvO3EQ2054ZTAU83f+F9wxP+fGyd52v+mQHfB6+aH54UxD4k7BhbOhExkTiSMVGQ+VBQMNYF1t5sCE4nA8xOdp3nOZyNJos1xkQQsZHKnMHWliTkNEfSkBIsJtEGqLQGDj5HPXLRjkZfxJxOJX2OhVZQ6v3vGOz1tGKnumd50pLBQbWivB1tGAR7GUpi78LAq46qpvNqzl1msBf/bjb2glvuQoK9IzT2iFtuFhGktnMF/WrNIVoyUkNmvHYLNa+Eumx5Z2G34q2q5r3ZFx/7A7k9CEA1KNm+AAAAAElFTkSuQmCC"
            alt="DexScreener"
            label="DexScreener"
          />
          <LinkItem
            href={`https://basescan.org/address/${contractAddress}`}
            imgSrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEGElEQVR4AbWWA5AcXRSFX2ytbe/+DNccx6vYtm3bTjm2jUGyVg/CRmzb6dwXdO12LaYHt+oMu/s797zbQMYWy7JVMzIyYkaPHjstOTlln1SmKBCJpDfFYukNqUxe2D459cCwESOmnz17Nh62rY4sVXfu3LGZOHHiJIlUdsfG1v577Tr12PLUyMaOFUuk9ydPnjqNJEl7k8HQRZWVK1f2a9Y8/GmduvU5gLHC+zRr3uL50uXLB+P0BMFfvnzZqHvPXkegY8Fgvho2smW79ehx8vXr17bGRu4qkyl05oL5kkikV+7fv+9RYecyOQe3uKRyBTZhV+aa9+7d95CloXx179HrRKkzsWLF6t4wwd/NBSQmibW7d+9OP3DgSFuscRMmbIY5KDETK1asGFQCjgckPDzysSU63LNnT2f+9SMqKuZ98W2aNw9//ubNGwduo6lTp46rW6+BRSI+efJkMuJVTEzca/4pOmHSpKnc2sNwMEIgdvaObOs2bTPaJaccxFK0bFXQoKGN0QawRCLJPWBXQ3B5Dbe1cxC09smpaSdh50rFYq4sb9kqV4gB3ARUMBo9evQkoTF36dJ1Ix+SnJy6V4iB6OjYV2CgAUpLS99dTtTf/fwDPvv5B3729PT+CmtnEQNOzq7fVq9e3QnhgqteXmlwX1//L0eOHGkFLp2x4CLlDXfBU+YawMs9d+78idyfIrGk1AFMSEy6iXi1YMGigeYYcHRy+Y6n/8/8qAiyK0qCe3qpBhJENxCvli1b1s9UAz4+fp8XLFo0/A9cSVxvqSq6rkVSqVxnbQPDho2gt27dKvvzPeMyFaYirj9TEuRF1LZd8hFrG4Cunf58Vhbd8FIR1E2InwUTO9CAQYPmW9kAVxcIOgDAzC84SEtORAcOH5bBZdgiBmDC2UKtNrE0uJKgoyDyhxwcS8tE43jqRsfEPjfXwPLly6fjO2op8VeCqIcC/GNxOHy/m5+fXw3hGjhw8HIhBrp3774GGVFKLekGsMMYyJdaS07nNtTr9b4BgcEfStzXE0UM4tWuXbu6QNRnzp8/H1oe2GBgq8P6DgTQ89Lg0P3Ls3rGkXeRWTA8MCjko5u757d//v3//dix45aUFmd54N1wZwVwK1UReYkH5WtUWY9ljiAvUH0koHYbDNXVBNlLWXSdqAAM3V+/cPw4WQOZWziN8zqqsVpLLeFNdzmibmYS11xNhp7SauvAQeJVWnoexHzZOCh3zt/O0FJhRsM2wimiKSRDNFo6WU1Qs2FqVXCgN4KgHJzKO1fIeCIhhc9RiHYCOH8rHMrpA+w/L/POnVrI1FLnUu5woGWg1wLA7yC1DcpLlB+yVGWTZH2NlkmBjtbCwTNg6h/BHHwF2FeY/qdwtcuB/zapdXSnzEt3bJCR9QPwKOxl9MLyXAAAAABJRU5ErkJggg=="
            alt="BaseScan"
            label="BaseScan"
          />
          <div
            onClick={handleAddToMetamask}
            className="flex items-center justify-center p-2 rounded-md bg-gray-100 font-medium text-xl"
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
