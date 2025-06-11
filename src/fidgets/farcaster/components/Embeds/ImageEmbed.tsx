/* eslint-disable @next/next/no-img-element */
import React, { useCallback } from "react";
import ExpandOnClick from "@/common/components/molecules/ExpandOnClick";
import { LazyImage } from "../LazyLoad";

const ImageEmbed = ({ url }: { url: string }) => {
  const onError = useCallback(() => {
    console.debug("error loading image", url);
  }, [url]);

  return (
    <ExpandOnClick>
      <LazyImage
        className="object-contain size-full max-h-[inherit]"
        src={url}
        onError={onError}
        referrerPolicy="no-referrer"
        alt="Embedded image"
      />
    </ExpandOnClick>
  );
};

export default ImageEmbed;
