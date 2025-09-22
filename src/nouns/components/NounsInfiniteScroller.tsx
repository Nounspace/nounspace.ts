"use client";
import NounDialogTrigger from "@nouns/components/NounDialogTrigger";
import { NounImageBase } from "@nouns/components/NounImage";
import { Noun } from "@nouns/data/noun/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function NounsInfiniteScroller({ nouns }: { nouns: Noun[] }) {
  // To fix SSR issues
  const [firstRowNounsDoubled, setFirstRowNounsDoubled] = useState<Noun[]>([]);
  const [secondRowNounsDoubles, setSecondRowNounsDoubles] = useState<Noun[]>(
    [],
  );

  useEffect(() => {
    // Create a copy before sorting
    const first = [...nouns].sort(() => Math.random() - 0.5).slice(0, 50);
    const second = [...nouns]
      .filter((noun) => !first.includes(noun))
      .sort(() => Math.random() - 0.5)
      .slice(0, 50);
    const doubleFirst = [...first, ...first];
    const doubleSecond = [...second, ...second];

    // Make sure there are at least 50 items in the double array
    while (doubleFirst.length > 0 && doubleFirst.length < 50) {
      doubleFirst.push(...first);
    }
    while (doubleSecond.length > 0 && doubleSecond.length < 50) {
      doubleSecond.push(...second);
    }

    setFirstRowNounsDoubled(doubleFirst.slice(0, 50));
    setSecondRowNounsDoubles(doubleSecond.slice(0, 50));
  }, [nouns]);

  return (
    <div className="flex w-full flex-col overflow-hidden">
      {/* First row - moving right */}
      <div className="relative flex py-2">
        <motion.div
          className="flex animate-none gap-4"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 250,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {firstRowNounsDoubled.map((noun, i) => (
            <motion.div
              whileHover={{
                scale: 1.05,
                filter: "brightness(90%)",
              }}
              className="h-[120px] w-[120px] overflow-hidden rounded-2xl md:h-[160px] md:w-[160px]"
              key={`row1-${noun.id}-${i}`}
            >
              <NounDialogTrigger noun={noun}>
                <NounImageBase noun={noun} width={160} height={160} />
              </NounDialogTrigger>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Second row - moving left */}
      <div className="relative flex py-2">
        <motion.div
          className="flex animate-none gap-4"
          animate={{
            x: ["-50%", "0%"],
          }}
          transition={{
            duration: 250,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {secondRowNounsDoubles.map((noun, i) => (
            <motion.div
              whileHover={{
                scale: 1.05,
                filter: "brightness(90%)",
              }}
              className="h-[120px] w-[120px] overflow-hidden rounded-2xl md:h-[160px] md:w-[160px]"
              key={`row2-${noun.id}-${i}`}
            >
              <NounDialogTrigger noun={noun}>
                <NounImageBase noun={noun} width={160} height={160} />
              </NounDialogTrigger>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
