import React, { CSSProperties } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetProperties, FidgetModule } from "@/common/fidgets";

export type GalleryFidgetSettings = {
  imageUrl: string;
};

const galleryConfig: FidgetProperties = {
  fidgetName: "gallery",
  fields: [
    {
      fieldName: "imageUrl",
      required: true,
      inputSelector: TextInput,
      default:
        "https://storage.googleapis.com/papyrus_images/d467b07030969fab95a8f44b1de596ab.png",
    },
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  },
};

const Gallery: React.FC<FidgetArgs<GalleryFidgetSettings>> = ({
  settings: { imageUrl },
}) => {
  const imageUrlStyle = {
    "--image-url": `url(${imageUrl})`,
  } as CSSProperties;

  return (
    <div className="rounded-md flex-1 items-center justify-center overflow-hidden relative size-full bg-cover">
      <div
        className="bg-[image:var(--image-url)] bg-cover size-full overflow-hidden"
        style={imageUrlStyle}
      ></div>
    </div>
  );
};

export default {
  fidget: Gallery,
  properties: galleryConfig,
} as FidgetModule<FidgetArgs<GalleryFidgetSettings>>;
