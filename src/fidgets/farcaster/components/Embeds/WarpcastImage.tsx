/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { Label } from "@/common/components/atoms/label";

const getImageViaCdnUrl = (imgUrl: string, skipCdn: boolean) => {
  if (imgUrl.startsWith("https://imagedelivery.net")) return imgUrl;

  if (!skipCdn && imgUrl.includes("imgur.com")) {
    const fileSuffix = imgUrl.split(".").slice(-1)[0];
    return `https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_${fileSuffix}/${imgUrl}`;
  }
  return imgUrl;
};

const WarpcastImage = ({ url }: { url: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [skipCdn, setSkipCdn] = useState(false);

  const onImageLoad = () => {
    setIsLoading(false);
  };

  const renderLoadingPlaceholder = () => {
    return (
      <div className="h-36 w-48 object-left relative block rounded-lg py-10 text-center animate-pulse rounded-md bg-primary/10">
        <PhotoIcon className="mx-auto h-12 w-12 text-foreground/70" />
        <Label>Loading image...</Label>
      </div>
    );
  };

  return (
    <>
      <img
        className="object-cover"
        style={{ display: isLoading ? "none" : "block" }}
        src={getImageViaCdnUrl(url, skipCdn)}
        alt=""
        referrerPolicy="no-referrer"
        onError={(e) => {
          if (skipCdn) return;

          console.debug("error loading image, retry without CDN", url);
          setSkipCdn(true);
        }}
        onLoad={onImageLoad}
      />
      {isLoading && renderLoadingPlaceholder()}
    </>
  );
};

export default WarpcastImage;
