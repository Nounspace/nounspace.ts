import React, { CSSProperties } from "react";
import TextInput from "@/common/components/molecules/TextInput";
import { FidgetArgs, FidgetEditConfig, FidgetModule } from "@/common/fidgets";

export type GalleryFidgetSettings = {
  imageUrl: string;
};

const galleryConfig: FidgetEditConfig = {
  fields: [
    {
      fieldName: "imageUrl",
      required: true,
      inputSelector: TextInput,
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
  editConfig: galleryConfig,
} as FidgetModule<FidgetArgs<GalleryFidgetSettings>>;
