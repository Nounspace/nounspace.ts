"use client";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { DESKTOP_NAV_ITEMS } from "./navConfig";

export default function DesktopNav() {
  const pathName = usePathname();

  return (
    <div className="hidden gap-2 md:flex">
      {DESKTOP_NAV_ITEMS.map((item, i) => {
        const active =
          item.href == "/"
            ? pathName == item.href
            : pathName?.includes(item.href);
        return (
          <Link
            href={item.href}
            className={twMerge(
              "flex items-center gap-2.5 px-[12px] py-1 transition-all",
              active
                ? "text-content-primary"
                : "text-content-secondary hover:text-content-primary",
            )}
            key={i}
          >
            <span className="text-[12px] font-bold leading-[16px] md:label-md">
              {item.name}
            </span>
            {item.new && (
              <div className="rounded-full bg-semantic-accent px-2 py-1 text-white label-sm">
                New
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
