"use client";
import { HTMLMotionProps, motion } from "framer-motion";
import { ReactNode } from "react";

const variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

interface AnimateInProps extends HTMLMotionProps<"div"> {
  delayS: number;
  children: ReactNode;
}

export default function AnimateIn({
  delayS,
  children,
  ...props
}: AnimateInProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      transition={{ duration: 1, type: "spring", bounce: 0, delay: delayS }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
