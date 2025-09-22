"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

const NAV_INFO = [
  { name: "Treasury", href: "/stats/treasury" },
  { name: "Leaderboard", href: "/stats/leaderboard" },
  { name: "Activity", href: "/stats/activity" },
  { name: "Clients", href: "/stats/clients" },
];

export default function StatsNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-[64px] z-[40] flex w-full max-w-full gap-6 border-b-2 border-border-secondary bg-white no-scrollbar md:static md:gap-10">
      {NAV_INFO.map((info, i) => {
        const selected = info.href == pathname;
        return (
          <Link
            href={info.href}
            className={clsx(
              "relative py-4",
              selected ? "text-content-primary" : "text-content-secondary",
            )}
            key={i}
          >
            {info.name}
            {selected && (
              <motion.div
                className="absolute bottom-[-2px] h-[2px] w-full bg-background-dark"
                layoutId="underline"
                transition={{ duration: 0.2 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
