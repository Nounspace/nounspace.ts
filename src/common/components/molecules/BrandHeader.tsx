import React from "react";
import Link from "next/link";
import Image from "next/image";
import { loadSystemConfig } from "@/config";

const BrandHeader = () => {
  const { assets, brand } = loadSystemConfig();
  const logoSrc = assets.logos.icon || assets.logos.main;
  return (
    <>
      <Link
        href="/home"
        className="flex items-center ps-2.5"
        rel="noopener noreferrer"
      >
        <div className="w-12 h-8 sm:w-16 sm:h-10 me-3 flex items-center justify-center">
          <Image
            src={logoSrc}
            alt={`${brand.displayName} Logo`}
            width={60}
            height={40}
            priority
            className="w-full h-full object-contain"
          />
        </div>
      </Link>

      {false && (
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
          Nounspace
        </span>
      )}
    </>
  );
};

export default BrandHeader;
