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
      <TooltipProvider>
        <Tooltip>
          <Link
            href="/home/Nouns"
            className="flex items-center ps-2.5"
            rel="noopener noreferrer"
          >
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Image
                  src="/images/noggles.svg"
                  className="h-13 me-3 mb-4"
                  alt="Nounspace Logo"
                  width={60}
                  height={40}
                />
              </div>
            </TooltipTrigger>
          </Link>
          <TooltipContent className=" bg-gray-200 font-black" side="left">
            <TooltipArrow className="fill-gray-200" />
            <div className="flex flex-col gap-1">
              <a
                className={`text-black text-base ${Londrina.className}`}
                href="https://nouns.wtf"
                target="_blank"
                rel="noopener noreferrer"
              >
                wtf is nouns? <FaExternalLinkAlt className="inline ml-1 mb-1" />
              </a>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {false && (
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
          Nounspace
        </span>
      )}
    </>
  );
};

export default BrandHeader;
