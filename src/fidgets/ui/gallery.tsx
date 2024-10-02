import React, { CSSProperties } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import {
  FidgetArgs,
  FidgetProperties,
  FidgetModule,
  type FidgetSettingsStyle,
} from "@/common/fidgets";
import { defaultStyleFields } from "@/fidgets/helpers";
import ImageScaleSlider from "@/common/components/molecules/ImageScaleSlider";

export type GalleryFidgetSettings = {
  imageUrl: string;
  RedirectionURL: string;
  Scale: number;
} & FidgetSettingsStyle;

const galleryConfig: FidgetProperties = {
  fidgetName: "Image",
  icon: 0x1f5bc,
  fields: [
    {
      fieldName: "imageUrl",
      required: true,
      inputSelector: TextInput,
      default:
        "https://storage.googleapis.com/papyrus_images/d467b07030969fab95a8f44b1de596ab.png",
      group: "settings",
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
    minHeight: 2,
    maxHeight: 36,
    minWidth: 2,
    maxWidth: 36,
  },
};

const Gallery: React.FC<FidgetArgs<GalleryFidgetSettings>> = ({ settings }) => {
  const contentStyle = {
    backgroundImage: `url(${settings.imageUrl})`,
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
    </div>
  );
};

export default {
  fidget: Gallery,
  properties: galleryConfig,
} as FidgetModule<FidgetArgs<GalleryFidgetSettings>>;
