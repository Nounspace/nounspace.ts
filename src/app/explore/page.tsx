import React from "react";
import { groupBy } from "lodash";
import Image from "next/image";
import { getAllMarkdownFiles } from "@/common/data/explore/loadExploreMarkdown";
import ExploreCard from "./ExploreCard";

const categories = [
  { title: "Nounish", image: "/images/explore-icons/nounish.png" },
  { title: "DeFi", image: "/images/explore-icons/defi.png" },
  { title: "Art", image: "/images/explore-icons/art.png" },
  { title: "Farcaster", image: "/images/explore-icons/farcaster.png" },
  { title: "Games", image: "/images/explore-icons/games.png" },
  { title: "Music", image: "/images/explore-icons/music.png" },
  { title: "AI", image: "/images/explore-icons/ai.png" },
  { title: "Public Goods", image: "/images/explore-icons/public-goods.png" },
  { title: "People", image: "/images/explore-icons/people.png" },
];

export default async function Explore() {
  const posts = await getAllMarkdownFiles();
  const groupedPosts = groupBy(posts, (post) => post?.category);

  return (
    <div className="min-h-screen max-w-screen h-screen w-screen">
      <div className="flex w-full h-full">
        {/* Main Content */}
        <div className="w-full transition-all duration-100 ease-out h-full p-5 grid grid-rows-[auto_1fr]">
          <div className="min-h-48 rounded-lg relative overflow-hidden grid grid-cols-1 grid-rows-1 place-content-center">
            <Image
              src="/images/rainforest.png"
              alt="Rainforest"
              fill
              className="col-span-1 row-span-1 object-cover object-bottom"
            />
            <div className="col-span-1 row-span-1 z-10 text-center font-bold text-white grid place-content-center text-4xl">
              Explore Featured Spaces
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 mt-5 overflow-auto">
            {categories.map(({ title, image }) => {
              if (!groupedPosts[title]) return null;

              return (
                <div
                  key={title}
                  className="flex flex-col gap-4 border-b border-b-slate-200 pb-8 last:border-b-0 last:pb-0"
                >
                  <h2 className="text-2xl font-bold flex flex-row gap-4 items-center">
                    <Image
                      src={image}
                      alt={title}
                      width={48}
                      height={48}
                      className="shrink-0"
                    />
                    {title}
                  </h2>
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {groupedPosts[title].map((post, i) => (
                      <ExploreCard key={`${post.slug}-${i}`} post={post} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
