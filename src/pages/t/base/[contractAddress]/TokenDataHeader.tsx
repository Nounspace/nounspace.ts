import React, { useEffect, useState } from "react";
import { AvatarImage, Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { IoMdShare } from "react-icons/io";
import { useReadContract } from "wagmi";
import tokensABI from "../../../../common/lib/utils/TokensAbi";
import { fetchTokenData } from "@/common/lib/utils/fetchTokenData";
import { formatNumber } from "@/common/lib/utils/formatNumber";

interface TokenTabBarHeaderProps {
  tokenImage: string | undefined;
  isPending: boolean;
  error: Error | null;
  tokenName: string | undefined;
  tokenSymbol: string | undefined;
  contractAddress: string;
}

const TokenTabBarHeader: React.FC<TokenTabBarHeaderProps> = ({
  tokenImage,
  isPending,
  error,
  tokenName,
  tokenSymbol,
  contractAddress,
}) => {
  const [tokenPrice, setTokenPrice] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(tokenImage || null);
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(tokenName || null);
  const [symbol, setSymbol] = useState<string | null>(tokenSymbol || null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const wagmiContractConfig = {
    address: contractAddress as `0x${string}`,
    abi: tokensABI,
  };

  const { data: contractImage } = useReadContract<
    typeof tokensABI,
    "image",
    []
  >({
    ...wagmiContractConfig,
    functionName: "image",
  });

  const { data: contractName } = useReadContract<typeof tokensABI, "name", []>({
    ...wagmiContractConfig,
    functionName: "name",
  });

  useEffect(() => {
    const getTokenData = async () => {
      try {
        const { price, image, marketCap, priceChange, tokenName, tokenSymbol } =
          await fetchTokenData(contractAddress, contractImage as string | null);
        setTokenPrice(price);
        setImage(image || (contractImage as string | null));
        setMarketCap(marketCap ? formatNumber(parseFloat(marketCap)) : null);
        setPriceChange(priceChange);
        setName(tokenName || (contractName as string | null));
        setSymbol(tokenSymbol);
        setFetchError(null);
      } catch (err) {
        console.error("Error fetching token data:", err);
        setFetchError("Failed to fetch token data. Please try again later.");
      }
    };

    getTokenData();
  }, [contractAddress, contractImage, contractName]);

  const handleAddToMetamask = async () => {
    try {
      const wasAdded = await (window as any).ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: contractAddress,
            symbol: symbol,
            decimals: 18,
            image: image,
          },
        },
      });

      if (wasAdded) {
        console.log("Token added to MetaMask");
      } else {
        console.log("Token not added");
      }
    } catch (error) {
      console.error("Error adding token to MetaMask", error);
    }
  };

  const handleOpenBasescan = () => {
    window.open(`https://basescan.org/address/${contractAddress}`, "_blank");
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    const tempInput = document.createElement("input");
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    alert("URL copied to clipboard");
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 w-full">
      {/* Avatar and Token Details */}
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <Avatar
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "100%",
            overflow: "hidden",
            backgroundColor: image ? "transparent" : "#ccc",
          }}
        >
          {image ? (
            <AvatarImage
              src={image}
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "100%",
                overflow: "hidden",
                backgroundColor: image ? "transparent" : "#ccc",
              }}
            />
          ) : (
            <AvatarFallback
              className="text-black font-bold"
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "100%",
                overflow: "hidden",
                backgroundColor: image ? "transparent" : "#ccc",
              }}
            >
              {name ? name.charAt(0) : "?"}
            </AvatarFallback>
          )}
          {name === "nounspace" && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <img
                src="/images/noggles.png"
                alt="NOGGLES"
                style={{ width: "20px", height: "20px" }}
              />
            </div>
          )}
        </Avatar>
        {/* Token Info */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-black">{name || "Loading..."}</span>
            <span className="text-gray-500 text-sm">{symbol || ""}</span>
          </div>
          <div className="text-gray-500 text-sm">
            {marketCap ? `$${marketCap}` : "Loading..."}
          </div>
        </div>
      </div>

      {/* Price and Icons */}
      <div className="flex items-center space-x-4">
        {/* Price Details */}
        <div className="text-right">
          <div className="text-black font-bold">
            {tokenPrice !== null ? `$${tokenPrice}` : "Loading..."}
          </div>
          <div
            className={`text-sm font-medium ${
              priceChange && parseFloat(priceChange) > 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {priceChange ? `${priceChange}%` : "Loading..."}
          </div>
        </div>
        {/* Action Icons */}
        <div className="flex items-center space-x-2">
          <img
            src="https://logosarchive.com/wp-content/uploads/2022/02/Metamask-icon.svg"
            alt="metamask"
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
            onClick={handleAddToMetamask}
          />
          <img
            src="https://cdn.worldvectorlogo.com/logos/etherscan-1.svg"
            alt="basescan"
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
            onClick={handleOpenBasescan}
          />
          <IoMdShare
            className="text-gray-500 cursor-pointer"
            onClick={handleCopyUrl}
          />
        </div>
        <div className="w-0.5 h-12 bg-gray-200 m-5" />
      </div>
      {fetchError && <div className="text-red-500">{fetchError}</div>}
    </div>
  );
};

export default TokenTabBarHeader;
