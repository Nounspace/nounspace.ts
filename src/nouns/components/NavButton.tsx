import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import { cn } from "@nouns/utils/shadcn";

interface NavButtonProps extends ComponentProps<typeof Button> {
  iconSrc: string;
  children: ReactNode;
  hoverRef: React.RefObject<HTMLDivElement>;
}

export default function NavButton({
  iconSrc,
  children,
  hoverRef,
  className,
  ...props
}: NavButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = hoverRef.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hoverRef]);

  return (
    <Button
      className={cn("relative gap-2 overflow-hidden", className)}
      {...props}
    >
      <MotionConfig transition={{ duration: 0.3, type: "spring", bounce: 0 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {!isHovered && (
            <motion.div
              key="left"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
            >
              <Image
                src={iconSrc}
                width={24}
                height={24}
                alt="Nav Icon"
                className="h-[24px] w-[24px]"
              />
            </motion.div>
          )}
          <motion.div key="word" layout>
            {children}
          </motion.div>
          {isHovered && (
            <motion.div
              key="right"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
            >
              <ArrowRightIcon size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </Button>
  );
}
