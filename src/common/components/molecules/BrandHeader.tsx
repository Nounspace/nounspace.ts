import React from "react";
import Link from "next/link";
import Image from "next/image";

const BrandHeader = () => {
  return (
    <Link href="/homebase" className="flex items-center ps-2.5 mb-4">
      <Image
        src="/images/noggles.svg"
        className="h-13 me-3"
        alt="Nounspace Logo"
        width={50}
        height={30}
      />
      {false && (
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
          Nounspace
        </span>
      )}
    </Link>
  );
};

export default BrandHeader;
