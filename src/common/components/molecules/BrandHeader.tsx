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
            href="/home"
            className="flex items-center ps-2.5"
            rel="noopener noreferrer"
          >
            <div className="w-14 h-14 flex items-center justify-center overflow-hidden rounded-md bg-white ml-3">
              <TooltipTrigger asChild>
                <Image
                  src="/images/noggles.svg"
                  className="h-13 me-3 mb-4"
                  alt="Nounspace Logo"
                  width={64}
                  height={64}
                  style={{ width: "auto", height: "auto" }}
                />
              </TooltipTrigger>
            </div>
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
