"use client";
import { Button } from "../ui/button";
import Image from "next/image";
import { LinkExternal } from "../ui/link";
import { ArrowRightLeft, Clock, ExternalLink, ShieldAlert } from "lucide-react";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogContentInner,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "../ui/DrawerDialog";

export default function BridgeToBaseDialog() {
  return (
    <DrawerDialog>
      <DrawerDialogTrigger asChild>
        <Button className="w-full gap-2 py-[10px]" variant="secondary">
          <Image
            src="/base.png"
            width={20}
            height={20}
            className="h-5 w-5"
            alt=""
          />
          Bridge to Base
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent className="md:max-h-[80vh] md:max-w-[425px]">
        <DrawerDialogContentInner className="gap-6">
          <DrawerDialogTitle className="heading-4">
            Bridge to Base
          </DrawerDialogTitle>
          <div className="flex w-full items-center justify-center">
            <Image src="/bridge-to-base.png" width={182} height={79} alt="" />
          </div>
          <span>
            When bridging $nouns to base you'll need to keep the following in
            mind:{" "}
          </span>
          <div className="flex gap-4">
            <ShieldAlert
              size={32}
              className="shrink-0 stroke-content-primary"
              strokeWidth={1.5}
            />
            <div className="flex flex-col">
              <span className="label-md">
                You can only redeem $nouns on Mainnet{" "}
              </span>
              <span className="text-content-secondary paragraph-sm">
                If you bridge to Base you will need to bridge back to redeem
                your $nouns for a Noun on Mainnet.
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Clock
              size={32}
              className="shrink-0 stroke-content-primary"
              strokeWidth={1.5}
            />
            <div className="flex flex-col">
              <span className="label-md">
                You'll have to wait ~7 days to bridge back.
              </span>
              <span className="text-content-secondary paragraph-sm">
                Withdrawals usually involve a{" "}
                <LinkExternal
                  href="https://github.com/ethereum-optimism/specs/blob/main/specs/protocol/withdrawals.md"
                  className="font-bold underline hover:brightness-75"
                >
                  ~7 days waiting period
                </LinkExternal>{" "}
                for fraud prevention.
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <ArrowRightLeft
              size={32}
              className="shrink-0 stroke-content-primary"
              strokeWidth={1.5}
            />
            <div className="flex flex-col">
              <span className="label-md">
                You may need to do multiple transactions
              </span>
              <span className="text-content-secondary paragraph-sm">
                Superbridge uses BaseNative Bridge contracts which are highly
                secure, but require a lot of processing.
              </span>
            </div>
          </div>
          <LinkExternal href="https://superbridge.app/" className="w-full">
            <Button className="flex w-full gap-[10px]">
              Continue to Superbridge
              <ExternalLink size={16} />
            </Button>
          </LinkExternal>
        </DrawerDialogContentInner>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
