"use client";
import Icon from "../ui/Icon";
import NounCard from "../NounCard";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CHAIN_CONFIG } from "@nouns/config";
import { Noun } from "@nouns/data/noun/types";
import Link from "next/link";
import { LinkExternal } from "../ui/link";
import { useQuery } from "@tanstack/react-query";
import { getNounsForAddress } from "@nouns/data/noun/getNounsForAddress";
import { Address } from "viem";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogContentInner,
  DrawerDialogTitle,
} from "../ui/DrawerDialog";
import LoadingSpinner from "../LoadingSpinner";
import { useModal } from "connectkit";

interface NounSelectDialogProps {
  holderAddress?: Address;
  selectedUserNoun?: Noun;
  selectedNounCallback: (noun?: Noun) => void;
  size?: number;
}

export default function NounSelectDialog({
  holderAddress,
  selectedUserNoun,
  selectedNounCallback,
  size,
}: NounSelectDialogProps) {
  const { data: userNouns } = useQuery({
    queryKey: ["get-nouns-for-address", holderAddress],
    queryFn: () => getNounsForAddress(holderAddress!),
    enabled: holderAddress != undefined,
    staleTime: 0,
  });

  const [open, setOpen] = useState<boolean>(false);
  const { setOpen: setOpenConnectModal } = useModal();

  // Clear selection if no address
  useEffect(() => {
    if (!holderAddress) {
      selectedNounCallback(undefined);
    }
  }, [holderAddress, selectedNounCallback]);

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <>
        {selectedUserNoun ? (
          <div className="relative flex hover:cursor-pointer">
            <button onClick={() => setOpen(true)}>
              <NounCard
                noun={selectedUserNoun}
                size={size ?? 200}
                enableHover={false}
                alwaysShowNumber
              />
            </button>
            <button
              onClick={() => selectedNounCallback(undefined)}
              className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-white"
            >
              <Icon
                icon="circleX"
                size={40}
                className="rounded-full border-2 border-white fill-gray-600"
              />
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              holderAddress != undefined ? setOpen(true) : setOpenConnectModal(true)
            }
            className="flex flex-col items-center justify-center gap-2 rounded-[20px] border-4 border-dashed bg-background-ternary p-8 text-content-secondary hover:brightness-[85%]"
            style={{ width: size ?? 200, height: size ?? 200 }}
          >
            <Image src="/noggles.png" width={64} height={64} alt="" />
            <h6>Select Noun</h6>
          </button>
        )}
      </>

      <DrawerDialogContent className="md:max-h-[80vh] md:max-w-[425px]">
        <DrawerDialogContentInner className="p-0">
          <DrawerDialogTitle className="w-full bg-white p-6 pb-2 shadow-fixed-bottom heading-4">
            Select Noun
          </DrawerDialogTitle>
          <div className="justify-top z-0 flex h-full min-h-[400px] w-full flex-col items-center overflow-y-auto [&>ol>li>div]:text-content-secondary">
            {userNouns == undefined ? (
              <LoadingSpinner />
            ) : userNouns.length == 0 ? (
              <div className="flex h-[244px] w-full flex-col items-center justify-center gap-2 px-8 py-6 text-center">
                <h4>No Nouns available</h4>
                <div className="text-content-secondary">
                  {CHAIN_CONFIG.chain.id == 1 ? (
                    <>
                      Don{"'"}t have a noun on Ethereum? Try Nouns.com on{" "}
                      <LinkExternal
                        className="text-semantic-accent hover:brightness-[85%]"
                        href="https://sepolia.nouns.com"
                      >
                        Sepolia Testnet
                      </LinkExternal>
                      .
                    </>
                  ) : (
                    <>
                      You don{"'"}t have a noun on Testnet.
                      <br />
                      Buy a{" "}
                      <Link href="/" className="text-semantic-accent">
                        Testnet Noun here
                      </Link>
                      .
                    </>
                  )}
                </div>
              </div>
            ) : (
              userNouns.map((noun, i) => (
                <button
                  className="flex w-full flex-row items-center gap-6 p-2 px-6 py-3 text-center hover:bg-background-secondary hover:brightness-[85%]"
                  onClick={() => {
                    selectedNounCallback(noun);
                    setOpen(false);
                  }}
                  key={i}
                >
                  <NounCard noun={noun} size={80} enableHover={false} />
                  <h4>Noun {noun.id}</h4>
                </button>
              ))
            )}
          </div>
        </DrawerDialogContentInner>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
