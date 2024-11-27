import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { formatEthereumAddress } from "@/common/lib/utils/ethereum";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { AlchemyNetwork, getAlchemyChainUrlV3 } from "@/fidgets/ui/gallery";
import { first } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { CHAIN_OPTIONS } from "./AlchemyChainSelector";
import { formatIpfsUrl } from "./VideoSelector";
import { useNeynarUser } from "@/common/lib/hooks/useNeynarUser";

export interface AlchemyVideoNftSelectorValue {
  chain: AlchemyNetwork | undefined;
  walletAddress: string;
  selectedImage: number | undefined;
  imageUrl: string;
}

export interface AlchemyVideoNftSelectorProps {
  onChange: (value: AlchemyVideoNftSelectorValue) => void;
  value: AlchemyVideoNftSelectorValue;
  className?: string;
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

  const { user: neynarUser, error: neynarError } = useNeynarUser(username);
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

  useEffect(() => {
    const abortController = new AbortController();

    const fetchNFTs = async () => {
      if (selectedChain && walletAddress) {
        const base_url = getAlchemyChainUrlV3(selectedChain);
        const url = `${base_url}/getNFTsForOwner?owner=${walletAddress}&pageSize=100`;
        const options = {
          method: "GET",
          headers: { accept: "application/json" },
          signal: abortController.signal,
        };

        try {
          const response = await fetch(url, options);
          const data = await response.json();
          if (data.error) {
            throw new Error(data.error.message);
          } else if (data.ownedNfts.length === 0) {
            throw new Error("No NFTs found for this address");
          } else {
            setError(null);
          }

          const videoNfts = data.ownedNfts.filter(
            (nft: any) => nft.raw?.metadata?.content?.mime === "video/mp4",
          );

          const images = videoNfts
            .map((nft: any) => formatIpfsUrl(nft.raw?.metadata?.content?.uri))
            .filter((url: string | null) => url !== null);

          setNftImages(images);
          setError(null);
        } catch (err: any) {
          if (!abortController.signal.aborted) {
            setError(err.message);
          }
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

  // Synchronize local state with props when props change
  useEffect(() => {
    setSelectedImage(value.selectedImage);
  }, [value.selectedImage]);

  useEffect(() => {
    setWalletAddress(value.walletAddress);
  }, [value.walletAddress]);

  useEffect(() => {
    setSelectedChain(value.chain);
  }, [value.chain]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="text-sm">Select Wallet Address</span>
        <Select
          onValueChange={(value) => setWalletAddress(value)}
          value={walletAddress}
        >
          <SelectTrigger className={className}>
            <SelectValue
              placeholder="Select a verified address"
              className="py-1 px-3 h-10 w-fit block bg-white border border-gray-300 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              {formatEthereumAddress(walletAddress) || "Select address"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {verifiedAddresses.map((address, i) => (
              <SelectItem value={address} key={i}>
                {formatEthereumAddress(address)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {walletAddress && (
        <div>
          <span className="text-sm">Select Network</span>
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
      )}
      {walletAddress && selectedChain && (
        <div>
          <span className="text-sm">Select NFT</span>
          <div className="grid grid-cols-3 gap-2 p-3 border border-gray-300 cursor-pointer rounded-lg max-h-[200px] overflow-y-scroll">
            {error ? (
              <div className="col-span-3 text-red-500 text-center">{error}</div>
            ) : (
              nftImages.map((image, index) => (
                <div
                  key={index}
                  className={`origin-center w-full aspect-square rounded-sm flex items-center justify-center overflow-hidden ${selectedImage === index ? "scale-105 border-2 border-blue-500" : "hover:scale-105 hover:border-2 hover:border-blue-300"}`}
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
                  {/* <img
                    src={image}
                    alt={`NFT ${index + 1}`}
                    className="w-full h-full object-cover"
                  /> */}
                  <video
                    autoPlay
                    loop
                    muted
                    controls={false}
                    src={image}
                    className="w-full h-full object-cover pointer-events-none"
                  ></video>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlchemyVideoNftSelector;
