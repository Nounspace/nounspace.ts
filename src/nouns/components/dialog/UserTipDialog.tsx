"use client";
import Icon from "../ui/Icon";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "@nouns/components/ui/input";
import { formatEther, parseEther, parseUnits } from "viem";
import { NATIVE_ASSET_DECIMALS } from "@nouns/utils/constants";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { formatTokenAmount } from "@nouns/utils/utils";
import { LinkExternal } from "../ui/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useAccount, useBalance } from "wagmi";
import { CHAIN_CONFIG } from "@nouns/config";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogContentInner,
  DrawerDialogTitle,
} from "../ui/DrawerDialog";
import { useModal } from "connectkit";

interface UserTipDialogProps {
  tip?: bigint;
  setTipCallback: (amount?: bigint) => void;
}

export default function UserTipDialog({
  tip,
  setTipCallback,
}: UserTipDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [formattedInputValue, setFormattedInputValue] = useState<
    string | undefined
  >(undefined);

  const { address } = useAccount();

  const { data: userBalance } = useBalance({
    address: address,
    token: CHAIN_CONFIG.addresses.wrappedNativeToken,
  });

  const { setOpen: setOpenConnectModal } = useModal();

  const insufficientBalance = useMemo(() => {
    if (userBalance != undefined && formattedInputValue != undefined) {
      return userBalance.value < parseEther(formattedInputValue);
    } else {
      false;
    }
  }, [userBalance, formattedInputValue]);

  // Clear selection if disconnected
  useEffect(() => {
    if (!address) {
      setTipCallback(undefined);
    }
  }, [address, setTipCallback]);

  return (
    <DrawerDialog open={open} onOpenChange={(open) => setOpen(open)}>
      <>
        {tip != undefined ? (
          <div className="relative hover:cursor-pointer">
            <button
              onClick={() => setOpen(true)}
              className="flex h-[200px] w-[200px] flex-col items-center justify-center gap-4 rounded-3xl bg-background-secondary"
            >
              <Image
                src="/ethereum-logo.png"
                width={64}
                height={64}
                alt="WETH"
              />
              <h5>{formatTokenAmount(tip, NATIVE_ASSET_DECIMALS, 6)} WETH</h5>
            </button>
            <button
              onClick={() => setTipCallback(undefined)}
              className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2"
            >
              <Icon
                icon="circleX"
                size={40}
                className="rounded-full border-4 border-white fill-gray-600"
              />
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              address != undefined ? setOpen(true) : setOpenConnectModal(true)
            }
            className="flex h-[200px] w-[200px] flex-col items-center justify-center gap-2 rounded-[20px] border-4 border-dashed bg-background-ternary p-8 text-content-secondary hover:brightness-[85%]"
          >
            <Image src="/tip.png" width={64} height={64} alt="" />
            <h6>Add a tip</h6>
          </button>
        )}
      </>

      <DrawerDialogContent className="md:max-h-[80vh] md:max-w-[425px]">
        <DrawerDialogContentInner>
          <DrawerDialogTitle className="w-full heading-4">
            Add a tip
          </DrawerDialogTitle>
          <div className="flex flex-col gap-4">
            <div>
              Incentivize the DAO to accept the Swap Prop. <br />
              You only pay this if the prop passes.
            </div>
            <div>
              <div className="relative">
                <Input
                  placeholder="0.00"
                  value={formattedInputValue}
                  className={twMerge(
                    "pr-24",
                    insufficientBalance && "border-negative",
                  )}
                  onChange={(e) => {
                    // Only positive decimal number inputs
                    const regex = /^(0|0[.][0-9]*|[1-9][0-9]*[.]?[0-9]*)$/;
                    if (e.target.value == "" || regex.test(e.target.value)) {
                      setFormattedInputValue(e.target.value);
                    }
                  }}
                />
                <div
                  className={twMerge(
                    "absolute right-5 top-1/2 flex h-full -translate-y-1/2 items-center border-l-2 pl-4 text-content-secondary",
                    insufficientBalance && "border-negative",
                  )}
                >
                  WETH
                </div>
              </div>
              <div
                className={twMerge(
                  "text-negative hidden",
                  insufficientBalance && "flex",
                )}
              >
                Insufficient WETH balance.
              </div>
            </div>
            <div className="text-content-secondary">
              Balance:{" "}
              <span className="font-bold">
                {userBalance != undefined
                  ? formatTokenAmount(
                      userBalance?.value,
                      NATIVE_ASSET_DECIMALS,
                      6,
                    )
                  : "--"}{" "}
                WETH{" "}
                <button
                  onClick={() =>
                    userBalance != undefined
                      ? setFormattedInputValue(formatEther(userBalance?.value))
                      : {}
                  }
                  className="text-semantic-accent hover:text-semantic-accent-dark"
                >
                  (Max)
                </button>
              </span>
            </div>

            <div className="flex flex-row items-center gap-3 rounded-xl bg-semantic-accent-light p-4">
              <Icon icon="circleQuestion" size={16} className="shrink-0" />
              <div className="paragraph-sm">
                Make sure you have enough WETH in your wallet when the prop
                executes.
                <div className="flex flex-row justify-between pt-2">
                  <Tooltip>
                    <TooltipTrigger className="text-content-secondary underline">
                      <div>Why Wrapped ETH?</div>
                    </TooltipTrigger>
                    <TooltipContent className="flex max-w-[270px] flex-col gap-2 bg-white text-content-primary">
                      <h6>Why WETH instead of ETH?</h6>
                      <div>
                        Using ETH as the tip would require sending it with the
                        creation or execution transaction, and additional smart
                        contract logic to ensure it is the correct amount for
                        the proposal.
                      </div>
                      <div>
                        In contrast, WETH can be pre-approved, then the transfer
                        is executed and enforced as a transaction within the
                        proposal.
                      </div>
                      <LinkExternal
                        href={CHAIN_CONFIG.swapForWrappedNativeUrl}
                        className="underline"
                      >
                        Get Wrapped ETH
                      </LinkExternal>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setTipCallback(
                  formattedInputValue != undefined
                    ? parseUnits(formattedInputValue, NATIVE_ASSET_DECIMALS)
                    : undefined,
                );
                setOpen(false);
              }}
              disabled={
                insufficientBalance ||
                formattedInputValue == undefined ||
                formattedInputValue == ""
              }
            >
              Add tip
            </Button>
          </div>
        </DrawerDialogContentInner>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
