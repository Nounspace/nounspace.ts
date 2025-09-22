import { getNounById } from "@nouns/data/noun/getNounById";
import { Noun } from "@nouns/data/noun/types";
import { buildNounImage } from "@nouns/utils/nounImages/nounImage";
import { cn } from "@nouns/utils/shadcn";
import Image from "next/image";
import { ComponentProps, Suspense } from "react";

interface NounImageProps
  extends Omit<ComponentProps<typeof Image>, "src" | "alt"> {
  nounId: string;
}

export function NounImage({ nounId, ...props }: NounImageProps) {
  return (
    <Suspense fallback={<NounImageBase noun={undefined} {...props} />}>
      <NounImageWrapper nounId={nounId} {...props} />
    </Suspense>
  );
}

async function NounImageWrapper({ nounId, ...props }: NounImageProps) {
  const noun = await getNounById(nounId);
  if (!noun) {
    throw Error(`NounImageInternal - no Noun found - ${nounId}`);
  }

  return <NounImageBase noun={noun} {...props} />;
}

export function NounImageBase({
  noun,
  className,
  ...props
}: { noun?: Noun } & Omit<ComponentProps<typeof Image>, "src" | "alt">) {
  const imageSrc = noun ? buildNounImage(noun.traits, "full") : undefined;
  return (
    <Image
      src={imageSrc ?? "/noun-loading-skull.gif"}
      unoptimized={imageSrc == undefined}
      alt="Noun"
      className={cn("pointer-events-none select-none object-cover", className)}
      {...props}
    />
  );
}
