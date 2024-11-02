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

export type GalleryFidgetSettings = {
  imageUrl: string;
  RedirectionURL: string;
  Scale: number;
  selectMediaSource: MediaSource;
  nftAddress: string;
  nftTokenId: string;
} & FidgetSettingsStyle;

const galleryConfig: FidgetProperties = {
  fidgetName: "Image",
  icon: 0x1f5bc,
  fields: [
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
      fieldName: "walletAddress",
      required: true,
      inputSelector: TextInput,
      default: "",
      group: "settings",
      disabledIf: (settings) =>
        settings?.selectMediaSource?.name !== "Select from Wallet",
    },
    {
      fieldName: "RedirectionURL",
      required: false,
      inputSelector: TextInput,
      default: "",
      group: "settings",
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

type AlchemyNetwork =
  | "eth"
  | "polygon"
  | "opt"
  | "arb"
  | "base"
  | "starknet"
  | "astar"
  | "frax"
  | "zora";

const getAlchemyChainUrlV3 = (network: AlchemyNetwork) => {
  return `https://${network}-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
};

const Gallery: React.FC<FidgetArgs<GalleryFidgetSettings>> = ({ settings }) => {
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.selectMediaSource?.name === "Import NFT") {
      const fetchNFTData = async () => {
        const { nftAddress, nftTokenId } = settings;
        const network: AlchemyNetwork = "base";
        const base_url = getAlchemyChainUrlV3(network);
        const url = `${base_url}/getNFTMetadata?contractAddress=${nftAddress}&tokenId=${nftTokenId}&refreshCache=false`;

        console.log(url);

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: { accept: "application/json" },
          });
          const data = await response.json();
          if (data.image && data.image.cachedUrl) {
            setNftImageUrl(data.image.cachedUrl);
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
    }
  }, [settings.selectMediaSource, settings.nftAddress, settings.nftTokenId]);

  const contentStyle = {
    backgroundImage: `url(${settings.selectMediaSource?.name === "Import NFT" ? nftImageUrl : settings.imageUrl})`,
    transform: `scale(${settings.Scale})`,
    transition: "transform 0.3s ease",
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
        {error && <div className="error-message">{error}</div>}
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
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default {
  fidget: Gallery,
  properties: galleryConfig,
} as FidgetModule<FidgetArgs<GalleryFidgetSettings>>;
