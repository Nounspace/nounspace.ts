import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AlchemyNetwork, getAlchemyChainUrlV3 } from "@/fidgets/ui/gallery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/atoms/select";
import { CHAIN_OPTIONS } from "./AlchemyChainSelector";
import { NeynarUser } from "@/pages/api/farcaster/neynar/user";
import { formatEthereumAddress } from "@/common/lib/utils/ethereum";
import { useFarcasterSigner } from "@/fidgets/farcaster";
import { useLoadFarcasterUser } from "@/common/data/queries/farcaster";
import { first, values } from "lodash";

export interface AlchemyNftSelectorValue {
  chain: AlchemyNetwork | undefined;
  walletAddress: string;
  selectedImage: number | undefined;
  imageUrl: string;
}

export interface AlchemyNftSelectorProps {
  onChange: (value: AlchemyNftSelectorValue) => void;
  value: AlchemyNftSelectorValue;
  className?: string;
}

export const AlchemyNftSelector: React.FC<AlchemyNftSelectorProps> = ({
  onChange,
  value,
  className,
}) => {
  const settings = CHAIN_OPTIONS;

  const farcasterSigner = useFarcasterSigner("gallery");
  const fid = farcasterSigner.fid <= 0 ? 196328 : farcasterSigner.fid;
  const { data } = useLoadFarcasterUser(fid);
  const user = useMemo(() => first(data?.users), [data]);
  const username = useMemo(() => user?.username, [user]);

  const [selectedImage, setSelectedImage] = useState<number | undefined>();
  const [walletAddress, setWalletAddress] = useState<string>(
    value.walletAddress,
  );

  const [selectedChain, setSelectedChain] = useState<
    AlchemyNetwork | undefined
  >();
  const [nftImages, setNftImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [verifiedAddresses, setVerifiedAddresses] = useState<string[]>([]);

  // const _onChange = useCallback(
  //   (val: AlchemyNftSelectorValue) => {
  //     onChange(val);
  //   },
  //   [onChange],
  // );

  // useEffect(() => {
  //   setSelectedChain(value.chain);
  //   setWalletAddress(value.walletAddress);
  //   setSelectedImage(value.selectedImage);
  // }, [value]);

  useEffect(() => {
    const fetchVerifiedAddress = async () => {
      try {
        const response = await fetch(
          `/api/farcaster/neynar/user?username=${username}`,
        );
        const data = await response.json();
        if (!data) {
          setError("No verified address found for user " + username);
          return;
        }

        const user = data.user as NeynarUser;
        if (user.verifications.length > 0) {
          setError(null);
          setVerifiedAddresses(user.verifications);
          setWalletAddress(user.verifications[0]);
        }
      } catch (err: any) {
        setError("Error fetching verified address");
        console.error("Error fetching verified address:", err);
      }
    };

    setVerifiedAddresses([]);
    fetchVerifiedAddress();
  }, [username]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (selectedChain && walletAddress) {
        const base_url = getAlchemyChainUrlV3(selectedChain);
        const url = `${base_url}/getNFTsForOwner?owner=${walletAddress}&pageSize=100`;
        const options = {
          method: "GET",
          headers: { accept: "application/json" },
        };

        try {
          const response = await fetch(url, options);
          const data = await response.json();
          if (data.error) {
            // setError(data.error.message);
            throw new Error(data.error.message);
          } else if (data.ownedNfts.length === 0) {
            throw new Error("No NFTs found for this address");
          } else {
            setError(null);
          }

          const images = data.ownedNfts.map(
            (nft: any) => nft.image.cachedUrl || "",
          );
          setNftImages(images);
          setError(null);
        } catch (err: any) {
          setError(err.message);
          console.error("Error fetching NFTs:", err);
        }
      }
    };

    fetchNFTs();
  }, [selectedChain, walletAddress]);

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
                  <img
                    src={image}
                    alt={`NFT ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlchemyNftSelector;
