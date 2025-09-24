import { ComponentProps, HTMLAttributes } from "react";
import { LinkExternal } from "../ui/link";
import { cn } from "@nouns/utils/shadcn";
import Image from "next/image";

interface ExternalFeaturedCardRootProps extends ComponentProps<typeof LinkExternal> {
  leftImgSrc: {
    desktop: string;
    mobile: string;
  };

  rightImgSrc: {
    desktop: string;
    mobile: string;
  };
}

export function ExternalFeaturedCard({
  leftImgSrc,
  rightImgSrc,
  className,
  children,
  ...props
}: ExternalFeaturedCardRootProps) {
  return (
    <LinkExternal
      includeReferrer
      className={cn(
        "relative flex h-[136px] w-full items-center justify-center overflow-hidden rounded-2xl hover:brightness-100",
        className
      )}
      {...props}
    >
      <div className="absolute bottom-0 left-0 z-0">
        {/* Lazy loading won't load hidden image (which is desired) */}
        <Image
          src={leftImgSrc.desktop}
          width={200}
          height={136}
          alt=""
          className="hidden object-contain object-left-bottom lg:block"
        />
        <Image
          src={leftImgSrc.mobile}
          width={80}
          height={136}
          alt=""
          className="block object-contain object-left-bottom lg:hidden"
        />
      </div>
      <div className="z-[1] flex h-full w-fit flex-col items-center justify-center gap-2">{children}</div>
      <div className="absolute bottom-0 right-0 z-0">
        {/* Lazy loading won't load hidden image (which is desired) */}
        <Image
          src={rightImgSrc.desktop}
          width={200}
          height={136}
          alt=""
          className="hidden object-contain object-right-bottom lg:block"
        />
        <Image
          src={rightImgSrc.mobile}
          width={80}
          height={136}
          alt=""
          className="block object-contain object-right-bottom lg:hidden"
        />
      </div>
    </LinkExternal>
  );
}

export function ExternalFeaturedCardButton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "text-background-dark label-sm rounded-full bg-white px-4 py-1.5 shadow-md hover:brightness-90",
        className
      )}
      {...props}
    />
  );
}
