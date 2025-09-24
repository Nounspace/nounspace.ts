"use client";
import NounDialogTrigger from "@nouns/components/NounDialogTrigger";
import { NounImageBase } from "@nouns/components/NounImage";
import { Noun } from "@nouns/data/noun/types";
import { cn } from "@nouns/utils/shadcn";
import clsx from "clsx";
import { HTMLMotionProps, motion } from "framer-motion";
import { useEffect, useState } from "react";

const BASE_DELAY = 0.2;
const L1_DELAY = BASE_DELAY;
const L2_DELAY = BASE_DELAY + 0.2;
const L3_DELAY = BASE_DELAY + 0.4;
const L4_DELAY = BASE_DELAY + 0.6;

interface FloatingNounsBackgroundProps {
  nouns: Noun[];
  forceSmall?: boolean;
}

export function FloatingNounsBackground({
  nouns,
  forceSmall,
}: FloatingNounsBackgroundProps) {
  // To fix SSR issues
  const [randomNouns, setRandomNouns] = useState<Noun[]>([]);

  useEffect(() => {
    // Generate the random nouns once on the client
    setRandomNouns(
      Array.from(
        { length: 22 },
        () => nouns[Math.floor(Math.random() * nouns.length)],
      ),
    );
  }, [nouns]);

  return (
    <>
      <div
        className={clsx(
          "absolute inset-0 select-none justify-center overflow-hidden",
          forceSmall ? "hidden" : "hidden md:flex",
        )}
      >
        <div className="relative h-full min-w-[1600px] max-w-[1600px]">
          {randomNouns.length >= 22 && (
            <>
              <FloatingNoun
                noun={randomNouns[0]}
                className="absolute left-[15px] top-[112px]"
                appearDelay={L4_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[1]}
                className="absolute left-[18px] top-[285px]"
                appearDelay={L4_DELAY}
              />

              <FloatingNoun
                noun={randomNouns[2]}
                className="absolute left-[137px] top-[15px]"
                appearDelay={L3_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[3]}
                className="absolute left-[132px] top-[126px]"
                appearDelay={L3_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[4]}
                className="absolute left-[118px] top-[266px]"
                appearDelay={L3_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[5]}
                className="absolute left-[125px] top-[372px]"
                appearDelay={L3_DELAY}
              />

              <FloatingNoun
                noun={randomNouns[6]}
                className="absolute left-[256px] top-[38px]"
                appearDelay={L2_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[7]}
                className="absolute left-[250px] top-[168px]"
                appearDelay={L2_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[8]}
                className="absolute left-[260px] top-[330px]"
                appearDelay={L2_DELAY}
              />

              <FloatingNoun
                noun={randomNouns[9]}
                className="absolute left-[395px] top-[100px]"
                appearDelay={L1_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[10]}
                className="absolute left-[385px] top-[233px]"
                appearDelay={L1_DELAY}
              />

              <FloatingNoun
                noun={randomNouns[11]}
                className="absolute left-[1135px] top-[115px]"
                appearDelay={L1_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[12]}
                className="absolute left-[1140px] top-[255px]"
                appearDelay={L1_DELAY}
              />

              <FloatingNoun
                noun={randomNouns[13]}
                className="absolute left-[1275px] top-[34px]"
                appearDelay={L2_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[14]}
                className="absolute left-[1270px] top-[188px]"
                appearDelay={L2_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[15]}
                className="absolute left-[1290px] top-[307px]"
                appearDelay={L2_DELAY}
              />

              <FloatingNoun
                noun={randomNouns[16]}
                className="absolute left-[1405px] top-[15px]"
                appearDelay={L3_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[17]}
                className="absolute left-[1395px] top-[140px]"
                appearDelay={L3_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[18]}
                className="absolute left-[1400px] top-[262px]"
                appearDelay={L3_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[19]}
                className="absolute left-[1410px] top-[376px]"
                appearDelay={L3_DELAY}
              />

              <FloatingNoun
                noun={randomNouns[20]}
                className="absolute left-[1500px] top-[105px]"
                appearDelay={L4_DELAY}
              />
              <FloatingNoun
                noun={randomNouns[21]}
                className="absolute left-[1510px] top-[260px]"
                appearDelay={L4_DELAY}
              />
            </>
          )}
        </div>
      </div>
      <div
        className={clsx(
          "relative h-[120px] w-full",
          forceSmall ? "block" : "block md:hidden",
        )}
      >
        {randomNouns.length >= 4 && (
          <>
            <FloatingNoun
              noun={randomNouns[0]}
              className="absolute left-[calc(50%-140px)] top-[15px] border-4 border-background-primary"
              appearDelay={0.2}
            />
            <FloatingNoun
              noun={randomNouns[1]}
              className="absolute left-[calc(50%-70px)] top-[15px] border-4 border-background-primary"
              appearDelay={0.2}
            />
            <FloatingNoun
              noun={randomNouns[2]}
              className="absolute left-[calc(50%-10px)] top-[15px] border-4 border-background-primary"
              appearDelay={0.2}
            />
            <FloatingNoun
              noun={randomNouns[3]}
              className="absolute left-[calc(50%+60px)] top-[15px] border-4 border-background-primary"
              appearDelay={0.2}
            />
          </>
        )}
      </div>
    </>
  );
}

function FloatingNoun({
  noun,
  className,
  appearDelay,
  ...props
}: { noun: Noun; appearDelay: number } & HTMLMotionProps<"img">) {
  const randomValues = {
    x: (Math.random() - 0.5) * 15, // Range: -7.5 to 7.5
    y: (Math.random() - 0.5) * 15, // Range: -7.5 to 7.5
    rotate: (Math.random() - 0.5) * 15, // Range: -7.5 to 7.5
    duration: 5 + Math.random() * 4, // Range: 5 to 9
  };

  const variants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    appear: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 1,
        bounce: 0,
        delay: appearDelay,
      },
    },
    breath: {
      rotate: [-randomValues.rotate, randomValues.rotate],
      x: [-randomValues.x, randomValues.x],
      y: [-randomValues.y, randomValues.y],
      transition: {
        duration: randomValues.duration,
        ease: [0.455, 0.03, 0.515, 0.955],
        repeat: Infinity,
        repeatType: "mirror" as const,
      },
    },
  };

  return (
    <motion.div
      width={80}
      height={80}
      className={cn(
        "h-[80px] w-[80px] overflow-hidden rounded-[12px]",
        className,
      )}
      variants={variants}
      initial="hidden"
      animate={["appear", "breath"]}
      whileHover={{ scale: 1.05, filter: "brightness(90%)" }}
      id={`noun-${noun.id}`}
      {...props}
    >
      <NounDialogTrigger noun={noun}>
        <NounImageBase noun={noun} width={80} height={80} />
      </NounDialogTrigger>
    </motion.div>
  );
}
