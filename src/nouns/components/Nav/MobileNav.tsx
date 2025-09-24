"use client";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import Icon from "../ui/Icon";
import clsx from "clsx";
import { MOBILE_NAV_ITEMS } from "./navConfig";

const HIDE_NAV_PATHNAME_REGEXS = [/^\/vote\/\d+$/];

export default function MobileNav() {
  const pathName = usePathname();

  const hide = false; // HIDE_NAV_PATHNAME_REGEXS.some((regex) => regex.test(pathName));

  return (
    <div
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50 justify-between gap-2 bg-white px-4 pb-[env(safe-area-inset-bottom)] shadow-fixed-bottom md:hidden",
        hide ? "hidden" : "flex",
      )}
    >
      {MOBILE_NAV_ITEMS.map((item, i) => {
        const active =
          item.href == "/"
            ? pathName == item.href
            : pathName?.includes(item.href);
        return (
          <Link
            href={item.href}
            className={twMerge(
              "flex flex-1 shrink-0 grow flex-col items-center justify-center gap-1 py-2",
              active ? "text-content-primary" : "text-content-secondary",
            )}
            key={i}
          >
            <Icon
              icon={item.icon}
              size={20}
              className={clsx(
                active ? "fill-content-primary" : "fill-background-disabled",
              )}
            />
            <span className="text-[12px] font-bold leading-[16px] md:label-md">
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
