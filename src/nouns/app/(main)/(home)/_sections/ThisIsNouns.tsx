import { getAllNouns } from "@nouns/data/noun/getAllNouns";
import { Suspense } from "react";
import AnimateIn from "@nouns/components/AnimateIn";
import VideoDialog from "@nouns/components/dialog/VideoDialog";
import Image from "next/image";
import { FloatingNounsBackground } from "@nouns/components/FloatingNounsBackground";

export default function ThisIsNouns() {
  return (
    <section className="relative flex h-fit w-full max-w-[1600px] flex-col items-center justify-center md:h-[484px]">
      <Suspense fallback={null}>
        <BackgroundWrapper />
      </Suspense>

      <div className="z-[1] flex flex-col items-center justify-center gap-4 px-6 text-center md:gap-8">
        <div className="flex w-full max-w-[480px] flex-col gap-2">
          <AnimateIn delayS={0}>
            <h1 className="hero">This is Nouns</h1>
          </AnimateIn>
          <AnimateIn delayS={0.2} className="paragraph-lg">
            Nouns are unique digital art pieces. One new Noun is auctioned every
            day, forever. They fund creative projects and form a
            community-owned, open-source brand that anyone can use and build
            upon.
          </AnimateIn>
        </div>

        <VideoDialog videoUrl="https://www.youtube.com/watch?v=lOzCA7bZG_k">
          <AnimateIn delayS={0.4}>
            <div className="flex items-center justify-between gap-4 rounded-xl border py-2 pl-2 pr-6 transition-colors hover:bg-background-secondary hover:brightness-100">
              <Image
                src="/this-is-nouns-video-thumbnail.png"
                width={113}
                height={64}
                alt="This is Nouns"
                className="rounded-lg"
              />
              <div className="flex flex-col items-center justify-center text-center">
                <span className="label-lg">This is Nouns</span>
                <span className="text-content-secondary paragraph-sm">
                  Watch the video
                </span>
              </div>
            </div>
          </AnimateIn>
        </VideoDialog>
      </div>
    </section>
  );
}

async function BackgroundWrapper() {
  const allNouns = await getAllNouns();
  return <FloatingNounsBackground nouns={allNouns} />;
}
