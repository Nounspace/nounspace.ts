import React from "react";
import { groupBy } from "lodash";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/common/components/organisms/Navigation";
import { useAppStore } from "@/common/data/stores/app";
import { getAllMarkdownFiles } from "@/common/data/explore/loadExploreMarkdown";

export async function getStaticProps() {
  const posts = await getAllMarkdownFiles();
  return {
    props: {
      posts,
    },
  };
}

const categories = [
  { title: "Nounish", image: "/images/explore-icons/nounish.png" },
  { title: "DeFi", image: "/images/explore-icons/defi.png" },
  { title: "Art", image: "/images/explore-icons/art.png" },
  { title: "Farcaster", image: "/images/explore-icons/farcaster.png" },
  { title: "Games", image: "/images/explore-icons/games.png" },
  { title: "Music", image: "/images/explore-icons/music.png" },
  { title: "AI", image: "/images/explore-icons/nounish.png" },
];

export default function Explore({ posts }) {
  const { homebaseConfig } = useAppStore((state) => ({
    homebaseConfig: state.homebase.homebaseConfig,
  }));
  const groupedPosts = groupBy(posts, (post) => post.category);

  return (
    <div className="min-h-screen max-w-screen h-screen w-screen">
      <div className="flex w-full h-full">
        {/* Sidebar */}
        <div className="flex mx-auto transition-all duration-100 ease-out z-10">
          <Navigation
            isEditable={false}
            enterEditMode={() => {}}
            theme={homebaseConfig?.theme}
          />
        </div>

        {/* Main Content */}
        <div className="w-full transition-all duration-100 ease-out h-full p-5 grid grid-rows-[auto_1fr]">
          <div className="min-h-48 rounded-lg relative overflow-hidden grid grid-cols-1 grid-rows-1 place-content-center">
            <Image
              src="/images/rainforest.png"
              alt="Rainforest"
              fill
              objectFit="cover"
              objectPosition="center bottom"
              className="col-span-1 row-span-1"
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
                  <ul className="grid grid-cols-4 gap-4">
                    {groupedPosts[title].map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/explore/${post.slug}`}
                          className="block border border-gray-300 rounded-lg overflow-hidden bg-[#FCFFF4]"
                        >
                          <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
                            <Image
                              src={post.image}
                              alt={post.title}
                              fill
                              objectFit="cover"
                              objectPosition="center"
                            />
                          </div>
                          <div className="p-4">
                            <h2 className="text-xl font-bold">@{post.title}</h2>
                            <p>{post.bio}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {/* {Object.entries(groupedPosts).map(([category, posts]) => (
              <div key={category} className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold">{category}</h2>
                <ul className="grid grid-cols-4 gap-4">
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/explore/${post.slug}`}
                        className="block border border-gray-300 rounded-lg overflow-hidden bg-[#FCFFF4]"
                      >
                        <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            objectFit="cover"
                            objectPosition="center"
                          />
                        </div>
                        <div className="p-4">
                          <h2 className="text-xl font-bold">@{post.title}</h2>
                          <p>{post.bio}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))} */}
          </div>
        </div>
      </div>
    </div>
  );
}
