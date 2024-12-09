import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { useNeynarUser } from "@/common/lib/hooks/useNeynarUser";
import { formatEthereumAddress } from "@/common/lib/utils/ethereum";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { AlchemyNetwork, getAlchemyChainUrlV3 } from "@/fidgets/ui/gallery";
import { first } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { CHAIN_OPTIONS } from "./AlchemyChainSelector";
import { zeroAddress } from "viem";
import Image from "next/image";

export interface AlchemyVideoNftSelectorValue {
  chain?: AlchemyNetwork;
  walletAddress?: string;
  selectedImage?: number;
  imageUrl?: string;
}

export interface AlchemyVideoNftSelectorProps {
  onChange: (value: AlchemyVideoNftSelectorValue) => void;
  value: AlchemyVideoNftSelectorValue;
  className?: string;
}

export function formatIpfsUrl(url?: string) {
  if (!url || !url.startsWith("ipfs://")) return url || "";
  const token = process.env.NEXT_PUBLIC_IPFS_TOKEN;
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = `https://gateway.pinata.cloud/ipfs/${url.split("://")[1]}`;
  return isDev && token ? `${baseUrl}?pinataGatewayToken=${token}` : baseUrl;
}

export function formatArweaveUrl(url?: string) {
  if (!url) return url;
  return `https://arweave.net/${url.split("://")[1]}`;
}

function formatNftUrl(nft: any, chain: AlchemyNetwork = "eth") {
  let baseUrl =
    nft.raw?.metadata?.content?.uri || nft.raw?.metadata?.animation_url;

  if (!baseUrl) {
    return null;
  }

  if (baseUrl.startsWith("ipfs://")) {
    baseUrl = formatIpfsUrl(baseUrl);
  } else if (baseUrl.startsWith("ar://")) {
    baseUrl = formatArweaveUrl(baseUrl);
  }

  const contractName = nft?.name || "";
  const contractAddress = nft.contract?.address || "";
  const thumbnailUrl = formatIpfsUrl(
    nft.image?.thumbnailUrl || nft?.raw?.metadata?.image || "",
  );

  const url = new URL(baseUrl);

  url.searchParams.set("contractName", contractName);
  url.searchParams.set("contractAddress", contractAddress);
  url.searchParams.set("thumbnailUrl", thumbnailUrl);
  url.searchParams.set("chain", chain);

  return url.toString();
}

export const AlchemyVideoNftSelector: React.FC<
  AlchemyVideoNftSelectorProps
> = ({ onChange, value, className }) => {
  const settings = CHAIN_OPTIONS;

  const farcasterSigner = useFarcasterSigner("gallery");
  const fid = farcasterSigner.fid;
  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);
  const username = useMemo(() => user?.username, [user]);

  const {
    user: neynarUser,
    error: neynarError,
    isLoading: isLoadingAddresses,
  } = useNeynarUser(username);
  const verifiedAddresses = useMemo(
    () => neynarUser?.verifications || [],
    [neynarUser],
  );

  // Initialize local state with values from props
  const [selectedImage, setSelectedImage] = useState<number | undefined>(
    value.selectedImage,
  );
  const [walletAddress, setWalletAddress] = useState<string | undefined>(
    value.walletAddress,
  );
  const [selectedChain, setSelectedChain] = useState<
    AlchemyNetwork | undefined
  >(value.chain);

  const [nftImages, setNftImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchNFTs = async () => {
      if (selectedChain && walletAddress) {
        setIsLoadingNFTs(true);
        const base_url = getAlchemyChainUrlV3(selectedChain);
        const url = `${base_url}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true&excludeFilters[]=AIRDROPS&pageSize=100`;
        const options = {
          method: "GET",
          headers: { accept: "application/json" },
          signal: abortController.signal,
        };

        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(`Error fetching NFTs: ${response.statusText}`);
          }
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error.message);
          } else if (data.ownedNfts.length === 0) {
            throw new Error("No NFTs found for this address");
          } else {
            setError(null);
          }

          const videoNfts = data.ownedNfts.filter(
            (nft: any) =>
              nft.raw?.metadata?.mimeType === "audio/wave" ||
              nft.raw?.metadata?.content?.mime === "video/mp4",
          );

          const images = videoNfts
            .map((nft: any) => {
              return formatNftUrl(nft, selectedChain);
            })
            .filter((url: string | null) => url !== null);

          setNftImages(images);
          setError(null);
        } catch (err: any) {
          if (!abortController.signal.aborted) {
            setError(err.message);
          }
        } finally {
          setIsLoadingNFTs(false);
        }
      }
    };

    fetchNFTs();

    return () => {
      abortController.abort();
    };
  }, [selectedChain, walletAddress]);

  // Show neynar error if present
  useEffect(() => {
    if (neynarError) {
      setError(neynarError);
    }
  }, [neynarError]);

  // useEffect(() => {
  //   setSelectedImage(value.selectedImage);
  // }, [value.selectedImage]);

  // useEffect(() => {
  //   setWalletAddress(value.walletAddress);
  // }, [value.walletAddress]);

  // useEffect(() => {
  //   setSelectedChain(value.chain);
  // }, [value.chain]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="text-sm">Wallet Address</span>
        <Select
          onValueChange={(value) => setWalletAddress(value)}
          value={walletAddress}
          disabled={isLoadingAddresses}
        >
          <SelectTrigger className={className}>
            <SelectValue
              placeholder={
                isLoadingAddresses
                  ? "Loading addresses..."
                  : "Select a verified address"
              }
              className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              {formatEthereumAddress(walletAddress) ||
                (isLoadingAddresses ? "Loading..." : "Select address")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {verifiedAddresses.length === 0 && !isLoadingAddresses ? (
              <SelectItem value={zeroAddress} disabled>
                No verified addresses found
              </SelectItem>
            ) : (
              verifiedAddresses.map((address, i) => (
                <SelectItem value={address} key={i}>
                  {formatEthereumAddress(address)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      {walletAddress && (
        <>
          <div>
            <span className="text-sm">Network</span>
            <Select
              onValueChange={(selectedId) => {
                const chain = settings.find((chain) => chain.id === selectedId);
                if (chain) {
                  setSelectedChain(chain.id);
                }
              }}
              value={selectedChain}
            >
              <SelectTrigger className={className}>
                <SelectValue
                  placeholder="Select a chain"
                  className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                >
                  {settings.find((chain) => chain.id === selectedChain)?.name ||
                    "Select a chain"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {settings.map((chain, i) => (
                  <SelectItem value={chain.id} key={i}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedChain && (
            <div>
              <span className="text-sm">NFT</span>
              <div className="grid grid-cols-3 gap-2 p-3 border border-gray-300 rounded-lg max-h-[200px] overflow-y-scroll">
                {isLoadingNFTs ? (
                  <div className="col-span-3 text-center">Loading NFTs...</div>
                ) : error ? (
                  <div className="col-span-3 text-red-500 text-center">
                    {error}
                  </div>
                ) : nftImages.length === 0 ? (
                  <div className="col-span-3 text-center">
                    No video or audio NFTs found
                  </div>
                ) : (
                  nftImages.map((image, index) => {
                    const thumbnailUrl =
                      new URL(image).searchParams.get("thumbnailUrl") || image;
                    return (
                      <div
                        key={index}
                        className={`relative cursor-pointer origin-center w-full aspect-square rounded-sm flex items-center justify-center overflow-hidden ${selectedImage === index ? "scale-105 border-2 border-blue-500" : "hover:scale-105 hover:border-2 hover:border-blue-300"}`}
                        onClick={() => {
                          setSelectedImage(index);
                          onChange({
                            chain: selectedChain,
                            walletAddress: walletAddress,
                            selectedImage: index,
                            imageUrl: image,
                          });
                        }}
                      >
                        <Image
                          src={thumbnailUrl}
                          alt="NFT Thumbnail"
                          width={200}
                          height={200}
                          className="w-full h-full object-cover pointer-events-none absolute"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <video
                          width={200}
                          height={200}
                          autoPlay
                          loop
                          muted
                          controls={false}
                          src={image}
                          className="w-full h-full object-cover pointer-events-none absolute z-10"
                        ></video>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AlchemyVideoNftSelector;
