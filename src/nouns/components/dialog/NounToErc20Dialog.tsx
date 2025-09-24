"use client";
import { useMemo } from "react";
import ProgressCircle from "../ProgressCircle";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialogBase";
import { Button } from "../ui/button";
import { twMerge } from "tailwind-merge";
import { useAccount } from "wagmi";
import { CHAIN_CONFIG } from "@nouns/config";
import { Noun } from "@nouns/data/noun/types";
import { useQuery } from "@tanstack/react-query";
import { getDoesNounRequireApprovalAndIsOwner } from "@nouns/data/noun/getDoesNounRequireApproval";
import { ApproveNoun } from "./transactionDialogPages/ApproveNoun";
import { NounsErc20DepositNoun } from "./transactionDialogPages/NounsErc20DepositNoun";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogContentInner,
  DrawerDialogTrigger,
} from "../ui/DrawerDialog";

interface NounToErc20DialogProps {
  depositNoun?: Noun;
}

export default function NounToErc20Dialog({
  depositNoun,
}: NounToErc20DialogProps) {
  const { address } = useAccount();

  const { data: nounRequiresApproval } = useQuery({
    queryKey: [
      "get-does-noun-require-approval-and-is-owner",
      depositNoun?.id,
      address,
      CHAIN_CONFIG.addresses.nounsErc20,
    ],
    queryFn: () =>
      getDoesNounRequireApprovalAndIsOwner(
        depositNoun!.id,
        address!,
        CHAIN_CONFIG.addresses.nounsErc20,
      ),
    refetchInterval: 1000 * 2,
    enabled: depositNoun != undefined && address != undefined,
  });

  const step: 0 | 1 | undefined = useMemo(() => {
    if (nounRequiresApproval == undefined) {
      return undefined;
    }

    return nounRequiresApproval ? 0 : 1;
  }, [nounRequiresApproval]);

  const progressStepper = useMemo(
    () => (
      <div className="flex w-full flex-col items-center justify-center gap-3 pt-3 text-content-secondary">
        {step != undefined && (
          <>
            <div className="flex w-full flex-row items-center justify-center gap-3 px-10 pb-8 paragraph-sm">
              <div className="relative">
                <ProgressCircle state={step == 0 ? "active" : "completed"} />
                <div className="absolute top-6 w-fit -translate-x-[calc(50%-6px)] whitespace-nowrap text-semantic-accent">
                  Approve Noun
                </div>
              </div>
              <div
                className={twMerge(
                  "h-1 w-1/3 bg-background-disabled",
                  step > 0 && "bg-semantic-accent",
                )}
              />
              <div className="relative">
                <ProgressCircle
                  state={
                    step == 0 ? "todo" : step == 1 ? "active" : "completed"
                  }
                />
                <div
                  className={twMerge(
                    "absolute top-6 w-fit -translate-x-[calc(50%-6px)] whitespace-nowrap",
                    step > 0 && "text-semantic-accent",
                  )}
                >
                  Convert
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    ),
    [step],
  );

  return (
    <DrawerDialog>
      <DrawerDialogTrigger asChild>
        <Button
          className="w-full md:w-fit"
          disabled={depositNoun == undefined || address == undefined}
        >
          Convert to $nouns
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent
        className="md:max-h-[80vh] md:max-w-[425px]"
        ignoreOutsideInteractions
      >
        <DrawerDialogContentInner>
          {depositNoun && step == 0 && (
            <ApproveNoun
              noun={depositNoun}
              spender={CHAIN_CONFIG.addresses.nounsErc20}
              progressStepper={progressStepper}
              reason="This will give the $nouns ERC-20 contract permission to deposit your Noun."
            />
          )}
          {depositNoun && step == 1 && (
            <NounsErc20DepositNoun
              noun={depositNoun}
              progressStepper={progressStepper}
            />
          )}
        </DrawerDialogContentInner>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
