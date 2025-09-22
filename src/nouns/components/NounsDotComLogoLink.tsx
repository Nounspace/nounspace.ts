import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";

export function NounsDotComLogoLink({ darkMode }: { darkMode?: boolean }) {
  return (
    <Link
      href="/"
      className="flex shrink grow-0 flex-row items-center gap-1.5 [&>img]:hover:rotate-12"
    >
      <Image
        src="/icon.png"
        width={44}
        height={44}
        className="transition-all ease-linear"
        alt=""
      />
      <div
        className={clsx(
          "hidden heading-4 md:flex",
          darkMode ? "text-white" : "text-content-primary",
        )}
      >
        Nouns.com
      </div>
    </Link>
  );
}
