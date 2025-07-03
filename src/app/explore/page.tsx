import React, { Suspense } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/atoms/tabs";
import {
  getAllMarkdownFiles,
  PostData,
} from "@/common/data/explore/loadExploreMarkdown";
import {
  tabContentClasses,
  tabListClasses,
  tabTriggerClasses,
} from "@/common/lib/theme/helpers";
import { groupBy } from "lodash";
import Image from "next/image";
import ExploreCard from "./ExploreCard";
import { TokensGrid } from "./Tokens";

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

const fetchTokens = async (page: number) => {
  const res = await fetch(
    `https://clanker-terminal.vercel.app/api/tokens?page=${page}`,
    {
      cache: "no-cache",
    },
  );
  if (!res.ok) {
    console.error("Failed to fetch tokens");
    return [];
  }
  const data = await res.json();
  return data;
};

export default async function Explore() {
  const posts = await getAllMarkdownFiles();
  const groupedPosts = groupBy(posts, (post: PostData) => post?.category);
  const tokens = await fetchTokens(1);

  return (
    <div className="min-h-screen max-w-screen w-screen p-5">
      <Tabs defaultValue="spaces">
        <TabsList className={tabListClasses}>
          <TabsTrigger value="spaces" className={tabTriggerClasses}>
            Spaces
          </TabsTrigger>
          <TabsTrigger value="tokens" className={tabTriggerClasses}>
            Tokens
          </TabsTrigger>
        </TabsList>
        <TabsContent value="spaces" className={tabContentClasses}>
          <div className="flex w-full h-full">
            <div className="w-full transition-all duration-100 ease-out h-full grid grid-rows-[auto_1fr]">
              <ExploreHeader
                title="Explore Featured Spaces"
                image="/images/rainforest.png"
              />
              <Suspense fallback={<div>Loading...</div>}>
                <CategoriesGrid
                  categories={categories}
                  groupedPosts={groupedPosts}
                />
              </Suspense>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tokens" className={tabContentClasses}>
          <div className="transition-all duration-100 ease-out grid grid-rows-[auto_1fr]">
            <ExploreHeader
              title="Explore Clanker Tokens"
              image="/images/clanker_galaxy.png"
            />
            <TokensGrid tokens={tokens} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
const ExploreHeader = ({ title, image }) => {
  return (
    <div className="min-h-48 rounded-lg relative overflow-hidden grid grid-cols-1 grid-rows-1 place-content-center">
      <Image
        src={image}
        alt={title}
        fill
        className="col-span-1 row-span-1 object-cover object-bottom"
      />
      <div className="col-span-1 row-span-1 z-10 text-center font-bold text-white grid place-content-center text-4xl"> 
        {title}
      </div>
    </div>
  );
};

const CategoriesGrid = ({ categories, groupedPosts }) => {
  return (
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
              {groupedPosts[title].map((post: PostData, i: number) => (
                <ExploreCard key={`${post.slug}-${i}`} post={post} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
