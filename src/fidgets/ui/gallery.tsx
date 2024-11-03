import React, { CSSProperties, useEffect, useState } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import ImageScaleSlider from "@/common/components/molecules/ImageScaleSlider";
import MediaSourceSelector, {
  MediaSource,
} from "@/common/components/molecules/MediaSourceSelector";
import AlchemyChainSelector from "@/common/components/molecules/AlchemyChainSelector";
import AlchemyNftSelector, {
  AlchemyNftSelectorValue,
} from "@/common/components/molecules/AlchemyNFTSelector";

export type GalleryFidgetSettings = {
  imageUrl: string;
  RedirectionURL: string;
  Scale: number;
  selectMediaSource: MediaSource;
  nftAddress: string;
  nftTokenId: string;
  network: AlchemyNetwork;
  nftSelector: AlchemyNftSelectorValue;
} & FidgetSettingsStyle;

const galleryConfig: FidgetProperties = {
  fidgetName: "Image",
  icon: 0x1f5bc,
  fields: [
    {
      fieldName: "RedirectionURL",
      required: false,
      inputSelector: TextInput,
      default: "",
      group: "style",
    },
    {
      fieldName: "selectMediaSource",
      displayName: "selectMediaSource",
      inputSelector: MediaSourceSelector,
      required: false,
      default: { name: "Image URL" },
      group: "settings",
    },
    {
      fieldName: "imageUrl",
      required: true,
      inputSelector: TextInput,
      default:
        "https://storage.googleapis.com/papyrus_images/d467b07030969fab95a8f44b1de596ab.png",
      group: "settings",
      disabledIf: (settings) =>
        settings?.selectMediaSource?.name !== "Image URL",
    },
    {
      fieldName: "network",
      displayName: "Network",
      inputSelector: AlchemyChainSelector,
      required: true,
      group: "settings",
      disabledIf: (settings) =>
        settings?.selectMediaSource?.name !== "Import NFT",
    },
    {
      fieldName: "nftSelector",
      displayName: "NFT",
      inputSelector: AlchemyNftSelector,
      required: true,
      group: "settings",
      disabledIf: (settings) =>
        settings?.selectMediaSource?.name !== "Select from Wallet",
    },
    {
      fieldName: "nftAddress",
      required: true,
      inputSelector: TextInput,
      default: "",
      group: "settings",
      disabledIf: (settings) =>
        settings?.selectMediaSource?.name !== "Import NFT",
    },
    {
      fieldName: "nftTokenId",
      required: true,
      inputSelector: TextInput,
      default: "",
      group: "settings",
      disabledIf: (settings) =>
        settings?.selectMediaSource?.name !== "Import NFT",
    },
    {
      fieldName: "Scale",
      required: false,
      inputSelector: ImageScaleSlider,
      default: 1,
      group: "style",
    },
    ...defaultStyleFields,
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  },
};

export type AlchemyNetwork =
  | "eth"
  | "polygon"
  | "opt"
  | "arb"
  | "base"
  | "starknet"
  | "astar"
  | "frax"
  | "zora";

export const getAlchemyChainUrlV3 = (network: AlchemyNetwork) => {
  return `https://${network}-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
};

const Gallery: React.FC<FidgetArgs<GalleryFidgetSettings>> = ({ settings }) => {
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.selectMediaSource?.name === "Import NFT") {
      const fetchNFTData = async () => {
        const { nftAddress, nftTokenId, network } = settings;
        const base_url = getAlchemyChainUrlV3(network);
        const url = `${base_url}/getNFTMetadata?contractAddress=${nftAddress}&tokenId=${nftTokenId}&refreshCache=false`;
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: { accept: "application/json" },
          });
          const data = await response.json();
          if (data.image && data.image.cachedUrl) {
            setNftImageUrl(data.image.cachedUrl);
            setError(null);
          } else {
            setError(
              "Error fetching image from NFT. Make sure the Network, Contract Address, and Token ID are all correct.",
            );
          }
        } catch (err) {
          setError(
            "Error fetching image from NFT. Make sure the Network, Contract Address, and Token ID are all correct.",
          );
        }
      };

      fetchNFTData();
    } else if (settings.selectMediaSource?.name === "Image URL") {
      setNftImageUrl(settings.imageUrl);
      setError(null);
    } else if (settings.selectMediaSource?.name === "Select from Wallet") {
      setNftImageUrl(settings.nftSelector?.imageUrl || "");
      setError(null);
    } else {
      setNftImageUrl(null);
      setError("Please select a media source.");
    }
  }, [
    settings.selectMediaSource,
    settings.nftAddress,
    settings.nftTokenId,
    settings.network,
  ]);

  const contentStyle = {
    backgroundImage: `url(${nftImageUrl})`,
    display: error ? "none" : "block",
    transform: `scale(${settings.Scale})`,
    transition: "transform 0.3s ease",
  } as CSSProperties;

  const errorStyle = {
    color: "red",
    textAlign: "center",
    marginTop: "10px",
  } as CSSProperties;

  const wrapperStyle = {
    overflow: "hidden",
  } as CSSProperties;

  return settings.RedirectionURL ? (
    <a
      href={settings.RedirectionURL}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute inset-0"
    >
      <div
        className="rounded-md flex-1 items-center justify-center relative size-full"
        style={wrapperStyle}
      >
        <div
          className="bg-cover bg-center w-full h-full"
          style={contentStyle}
        ></div>
        {error && <div style={errorStyle}>{error}</div>}
      </div>
    </a>
  ) : (
    <div
      className="rounded-md flex-1 items-center justify-center relative size-full"
      style={wrapperStyle}
    >
      <div
        className="bg-cover bg-center w-full h-full"
        style={contentStyle}
      ></div>
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
};

export default {
  fidget: Gallery,
  properties: galleryConfig,
} as FidgetModule<FidgetArgs<GalleryFidgetSettings>>;
