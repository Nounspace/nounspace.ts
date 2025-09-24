"use client";
import { Carousel, CarouselContent, CarouselItem } from "@nouns/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ExternalFeaturedCard, ExternalFeaturedCardButton } from "./ExternalFeaturedCard";
import { ReactNode } from "react";

interface BannerItem {
  node: ReactNode;
}

const BANNER_ITEMS: BannerItem[] = [
  {
    node: (
      <ExternalFeaturedCard
        href="https://www.yellowcollective.xyz/"
        leftImgSrc={{
          desktop: "/featured/yellow/desktop/left.png",
          mobile: "/featured/yellow/mobile/left.png",
        }}
        rightImgSrc={{
          desktop: "/featured/yellow/desktop/right.png",
          mobile: "/featured/yellow/mobile/right.png",
        }}
        className="bg-[#FBCB05]"
      >
        <div className="label-sm text-[#0D6EFD]">Featured DAO</div>
        <h3>Yellow Collective</h3>
        <ExternalFeaturedCardButton>View Yellow</ExternalFeaturedCardButton>
      </ExternalFeaturedCard>
    ),
  },
  {
    node: (
      <ExternalFeaturedCard
        href="https://bigshottoyshop.com/products/nounish-friends-blind-box-mini-figure"
        leftImgSrc={{
          desktop: "/featured/nounish-toys/desktop/left.png",
          mobile: "/featured/nounish-toys/mobile/left.png",
        }}
        rightImgSrc={{
          desktop: "/featured/nounish-toys/desktop/right.png",
          mobile: "/featured/nounish-toys/mobile/right.png",
        }}
        className="bg-[#DEE2E6]"
      >
        <div className="label-sm text-[#0D6EFD]">Featured product</div>
        <h3>NOUNish Toys</h3>
        <ExternalFeaturedCardButton>Buy toys</ExternalFeaturedCardButton>
      </ExternalFeaturedCard>
    ),
  },
  {
    node: (
      <ExternalFeaturedCard
        href="https://nns.xyz?ref=0x65599970af18eea5f4ec0b82f23b018fd15ebd11"
        leftImgSrc={{
          desktop: "/featured/nns/desktop/left.png",
          mobile: "/featured/nns/mobile/left.png",
        }}
        rightImgSrc={{
          desktop: "/featured/nns/desktop/right.png",
          mobile: "/featured/nns/mobile/right.png",
        }}
        className="bg-[#C496FF]"
      >
        <div className="label-sm text-[#0949A9]">Featured product</div>
        <h3>Nouns Name Service</h3>
        <ExternalFeaturedCardButton>Get your name</ExternalFeaturedCardButton>
      </ExternalFeaturedCard>
    ),
  },
  {
    node: (
      <ExternalFeaturedCard
        href="https://nouns.movie"
        leftImgSrc={{
          desktop: "/featured/nouns-movie/desktop/left.png",
          mobile: "/featured/nouns-movie/mobile/left.png",
        }}
        rightImgSrc={{
          desktop: "/featured/nouns-movie/desktop/right.png",
          mobile: "/featured/nouns-movie/mobile/right.png",
        }}
        className="bg-background-dark"
      >
        <div className="label-sm text-semantic-warning">Featured video</div>
        <h3 className="text-white">Nouns Movie</h3>
        <ExternalFeaturedCardButton>Watch now</ExternalFeaturedCardButton>
      </ExternalFeaturedCard>
    ),
  },
];

export default function ExternalFeaturedCarousel() {
  return (
    <Carousel opts={{ loop: true, align: "start" }} plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}>
      <CarouselContent className="-ml-4 flex">
        {BANNER_ITEMS.map((item, i) => (
          <CarouselItem className="h-fit basis-full pl-4 md:basis-1/2" key={i}>
            {item.node}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
