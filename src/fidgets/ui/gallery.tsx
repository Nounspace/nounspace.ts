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
    <div className ="rounded-md flex-1 items-center justify-center overflow-hidden relative size-full bg-cover">
      <div className ="bg-[image:var(--image-url)] bg-cover size-full overflow-hidden"
            style={{'--image-url': `url(${imageUrl})`}}
      ></div>
      {/* <div className = "flex items-center justify-center opacity-0 hover:opacity-100 duration-500 absolute inset-0 z-10 flex bg-slate-400 bg-opacity-50">
        <button onClick={switchMode} className = "absolute flex-1 size-1/12 opacity-50 hover:opacity-100 duration-500 z-10 flex justify-center items-center text-white font-semibold text-2xl">
          <FaGear />
        </button>
      </div>
      <Image 
        src={imageUrl}
        alt={imageUrl}
        fill
        style={{objectFit: 'contain'}}
      /> */}
    </div>
  )
}

export default {
  fidget: Gallery,
  editConfig: galleryConfig,
} as FidgetModule<GalleryFidgetSettings>;