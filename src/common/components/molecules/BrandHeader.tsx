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
import { loadSystemConfig } from "@/config";

const Londrina = Londrina_Solid({ subsets: ["latin"], weight: "400" });

const BrandHeader = () => {
  const { assets, brand } = loadSystemConfig();
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <Link
            href="/home"
            className="flex items-center ps-2.5"
            rel="noopener noreferrer"
          >
            <TooltipTrigger asChild>
              <div className="w-12 h-8 sm:w-16 sm:h-10 me-3 flex items-center justify-center">
                <Image
                  src={assets.logos.icon || assets.logos.main}
                  alt={`${brand.displayName} Logo`}
                  width={60}
                  height={40}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
            </TooltipTrigger>
          </Link>
          <TooltipContent className="bg-gray-200 font-black" side="left">
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
