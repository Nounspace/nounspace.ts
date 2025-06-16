import React from "react";
import Link from "next/link";
import Image from "next/image";

const BrandHeader = () => {
  return (
    <>
      <Link
        href="/home"
        className="flex items-center ps-2.5 -mt-[20px] pb-[3px]"
        rel="noopener noreferrer"
      >
        <Image
          src="/images/noggles.svg"
          className="h-13 me-3"
          alt="Nounspace Logo"
          width={60}
          height={40}
        />
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
