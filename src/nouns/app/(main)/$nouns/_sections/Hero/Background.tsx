"use client";
import { cn } from "@nouns/utils/shadcn";
import { motion, HTMLMotionProps } from "framer-motion";
import Image from "next/image";

const BASE_DELAY = 0.2;

// prettier-ignore
const TOKENS: {
  size: number;
  left: number;
  top: number;
  appearDelay: number;
  baseRotation: number;
}[] = [
  { size: 80, left: 132, top: 120, baseRotation: 24, appearDelay: BASE_DELAY + 0.7 },
  { size: 95, left: 248, top: 45, baseRotation: 29, appearDelay: BASE_DELAY + 0.6 },
  { size: 60, left: 223, top: 278, baseRotation: -51, appearDelay: BASE_DELAY + 0.5 },
  { size: 80, left: 337, top: 145, baseRotation: 7, appearDelay: BASE_DELAY + 0.4 },
  { size: 60, left: 407, top: 284, baseRotation: -16, appearDelay: BASE_DELAY + 0.3 },
  { size: 80, left: 471, top: 60, baseRotation: -38, appearDelay: BASE_DELAY + 0.2},
  { size: 63, left: 594, top: 92, baseRotation: 25, appearDelay: BASE_DELAY + 0.1 },

  { size: 67, left: 782, top: 35, baseRotation: 25, appearDelay: BASE_DELAY },

  { size: 58, left: 945, top: 124, baseRotation: -17, appearDelay: BASE_DELAY + 0.1 },
  { size: 71, left: 1011, top: 36, baseRotation: 9, appearDelay: BASE_DELAY + 0.2 },
  { size: 65, left: 1116, top: 127, baseRotation: -17, appearDelay: BASE_DELAY + 0.3 },
  { size: 45, left: 1221, top: 32, baseRotation: 20, appearDelay: BASE_DELAY + 0.4 },
  { size: 100, left: 1212, top: 204, baseRotation: 14, appearDelay: BASE_DELAY + 0.5 },
  { size: 57, left: 1322, top: 40, baseRotation: -12, appearDelay: BASE_DELAY + 0.6 },
  { size: 71, left: 1371, top: 174, baseRotation: 0, appearDelay: BASE_DELAY + 0.7 },
];

export default function Background() {
  return (
    <div className="absolute inset-0 flex justify-center overflow-hidden">
      <div className="relative h-full min-w-[1600px] max-w-[1600px]">
        {TOKENS.map((token, i) => (
          <FloatingToken
            size={token.size}
            style={{ left: token.left, top: token.top }}
            className="absolute"
            appearDelay={token.appearDelay}
            baseRotation={token.baseRotation}
            id={`token-${i}`}
            key={i}
          />
        ))}
      </div>
    </div>
  );
}

function FloatingToken({
  className,
  appearDelay,
  size,
  baseRotation,
  ...props
}: {
  appearDelay: number;
  size: number;
  baseRotation: number;
} & HTMLMotionProps<"img">) {
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
      rotate: [
        -randomValues.rotate + baseRotation,
        randomValues.rotate + baseRotation,
      ],
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
      className={cn("pointer-events-none overflow-hidden", className)}
      variants={variants}
      initial="hidden"
      animate={["appear", "breath"]}
      {...props}
    >
      <Image
        src="/$nouns.png"
        width={102}
        height={102}
        alt="$nouns token"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
}
