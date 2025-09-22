import Image from "next/image";
import { Suspense } from "react";
import { getImageSize } from "@nouns/data/image/getImageSize";
import { Skeleton } from "../ui/skeleton";

export default async function MarkdownImage({
  src,
  title,
}: {
  src?: string;
  title?: string;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
      <MarkdownImageWrapper src={src} title={title} />
    </Suspense>
  );
}

async function MarkdownImageWrapper({
  src,
  title,
}: {
  src?: string;
  title?: string;
}) {
  if (!src) {
    return null;
  }

  const { width, height } = await getImageSize(src);

  let clampedWidth = 800;
  let clampedHeight = 0;
  if (width && height) {
    const aspect = width / height;

    clampedWidth = Math.min(800, width);
    clampedHeight = Math.min(height, width / aspect);
  }

  return (
    <div className="flex flex-col gap-1">
      <Image
        src={src}
        width={clampedWidth}
        height={clampedHeight}
        alt={title ?? ""}
        className="max-w-full rounded-md"
      />
      <span className="text-content-secondary label-sm">{title}</span>
    </div>
  );
}
