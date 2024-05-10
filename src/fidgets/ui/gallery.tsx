import React from 'react';
import Image from "next/image";
import TextInput from "@/common/ui/molecules/TextInput";
import { FidgetEditConfig, FidgetModule } from "@/common/fidgets";

export type GalleryFidgetSettings = {
  imageUrl: string,
}

const galleryConfig: FidgetEditConfig = {
  fields: [
    {
      fieldName: "imageUrl",
      required: true,
      inputSelector: TextInput,
    }
  ],
  size: {
    minHeight: 1,
    maxHeight: 36,
    minWidth: 1,
    maxWidth: 36,
  }
};

const Gallery: React.FC<GalleryFidgetSettings> = ({ imageUrl }: GalleryFidgetSettings) => {
  return (
    <Image 
      src={imageUrl}
      alt={imageUrl}
      fill
      style={{objectFit: 'contain'}}
    />
  )
}

export default {
  fidget: Gallery,
  editConfig: galleryConfig,
} as FidgetModule<GalleryFidgetSettings>;