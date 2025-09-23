"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@nouns/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import clsx from "clsx";
import Image from "next/image";
import { LinkExternal } from "@nouns/components/ui/link";

const PROJECTS: ProjectCard[] = [
  {
    title: "Precious Noggles: Recycled Sunglasses",
    imgSrc: "/project/precious-noggles.png",
    link: "https://www.youtube.com/watch?v=ZGd_mPiTMgQ",
  },
  {
    title: "Hyalinobatrachium Nouns",
    imgSrc: "/project/frog.png",
    link: "https://explore.nouns.world/hyalinobatrachium-nouns/",
  },
  {
    title: "Quack and Lola",
    imgSrc: "/project/quack.png",
    link: "https://www.instagram.com/meetquack/?hl=en",
  },
  {
    title: "Bud Light x Nouns Super Bowl Commercial",
    imgSrc: "/project/bud-light.png",
    link: "https://explore.nouns.world/bud-light-and-nouns-super-bowl/",
  },
  {
    title: "Dustin Yellin's PERSON, PLACE, or THING ",
    imgSrc: "/project/dustin-yellin.png",
    link: "https://explore.nouns.world/dustin-yellins-person-place-or-thing/",
  },
  {
    title: "John Hamon x Nouns",
    imgSrc: "/project/john-hamon.png",
    link: "https://explore.nouns.world/john-hamon-and-nouns/",
  },
  {
    title: "The Rise of Blus: A Nouns Movie",
    imgSrc: "/project/rise-of-blus.png",
    link: "https://nouns.movie/",
  },
  {
    title: "Nouns House: The hub for builders in São Paulo",
    imgSrc: "/project/nouns-house.png",
    link: "https://instagram.com/nouns_house",
  },
  {
    title: "Gnars: Nouns Action Sports Team",
    imgSrc: "/project/gnars.png",
    link: "https://gnars.com/",
  },
  {
    title: "The Rose Parade: Shark Pickle Cone",
    imgSrc: "/project/rose-parade.png",
    link: "https://x.com/NounsDoc/status/1836027328616386725",
  },
  {
    title: "Nouns Esports: A New Model for Gaming",
    imgSrc: "/project/e-sports.png",
    link: "https://nouns.gg/",
  },
];

export default function NounsFundsIdeas() {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 md:gap-14">
      <div className="flex flex-col items-center justify-center gap-2 px-6 text-center md:px-10">
        <h2>Nouns Funds Ideas</h2>
        <div className="max-w-[480px] paragraph-lg">
          Proceeds from daily auctions are used to support ideas of all shapes
          and sizes, like these:
        </div>
      </div>

      <Carousel
        opts={{
          align: "center",
          skipSnaps: true,
          startIndex: Math.floor(PROJECTS.length / 2),
          loop: true,
        }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {PROJECTS.map((item, i) => (
            <CarouselItem
              className={clsx("max-w-full shrink-0 basis-auto pl-4")}
              key={i}
            >
              <ProjectCard {...item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

interface ProjectCard {
  title: string;
  imgSrc: string;
  link: string;
}

function ProjectCard({ title, imgSrc, link }: ProjectCard) {
  return (
    <LinkExternal
      href={link}
      className="relative flex h-[408px] w-[306px] flex-col justify-end overflow-hidden rounded-[20px]"
    >
      <Image
        src={imgSrc}
        width={306}
        height={408}
        alt={title}
        className="absolute inset-0 select-none"
      />
      <div
        className="z-[1] select-none px-4 pb-6 pt-[28px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%)",
        }}
      >
        <h5 className="text-white">{title}</h5>
      </div>
    </LinkExternal>
  );
}
