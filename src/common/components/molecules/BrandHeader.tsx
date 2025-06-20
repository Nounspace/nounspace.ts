import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../atoms/tooltip";
import { Tooltip, TooltipArrow } from "@radix-ui/react-tooltip";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Londrina_Solid } from "next/font/google";

const Londrina = Londrina_Solid({ subsets: ["latin"], weight: "400" });

const BrandHeader = () => {
  return (
    <>
      <Link
        href="/home"
        className="flex items-center ps-2.5 -mt-[3px] mb-[34px]"
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
