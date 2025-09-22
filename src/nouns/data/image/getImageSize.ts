"use server";
import sharp from "sharp";
import { unstable_cache } from "next/cache";

async function getImageSizeUncached(src: string) {
  try {
    let buffer: Buffer;

    if (src.startsWith("data:image")) {
      // Handle base64 image
      const base64Data = src.split(",")[1];
      buffer = Buffer.from(base64Data, "base64");
    } else {
      // Handle remote image
      const resp = await fetch(src, { cache: "no-store" }); // Disable cache here, since some images may be > 2MB (we cache the generated output)
      buffer = Buffer.from(await resp.arrayBuffer());
    }

    // Extract dimensions
    const { width, height } = await sharp(buffer).metadata();
    return { width, height };
  } catch (e) {
    console.log("Error fetching image size", e);
    return { width: undefined, height: undefined };
  }
}

export const getImageSize = unstable_cache(getImageSizeUncached, [
  "get-image-size",
]);
