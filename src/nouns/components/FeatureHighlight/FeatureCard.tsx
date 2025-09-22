import Image, { StaticImageData } from "next/image";
import { Button } from "@nouns/components/ui/button";
import { HTMLAttributes } from "react";
import { cn } from "@nouns/utils/shadcn";
import { Slottable } from "@radix-ui/react-slot";

interface FeatureCardProps extends HTMLAttributes<HTMLButtonElement> {
  title: string;
  description: string;
  cta: string;
  imgSrc: string;
  onCtaClick: () => void;
}

export default function FeatureCard({
  title,
  description,
  cta,
  onCtaClick,
  imgSrc,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <button
      className={cn(
        "relative flex h-[160px] flex-1 justify-between overflow-hidden rounded-2xl bg-background-secondary label-md",
        className,
      )}
      onClick={onCtaClick}
      {...props}
    >
      <div className="flex flex-col gap-4 py-6 pl-6 text-start">
        <div>
          <span>{title}.</span>{" "}
          <span className="text-content-secondary">{description}</span>
        </div>
        <Button
          variant="secondary"
          className="h-8 w-fit rounded-full px-5 py-3"
          asChild
        >
          <Slottable>
            <div>{cta}</div>
          </Slottable>
        </Button>
      </div>
      <Image
        src={imgSrc}
        alt=""
        width={140}
        height={160}
        className="h-[160px] w-[140px]"
      />
    </button>
  );
}
