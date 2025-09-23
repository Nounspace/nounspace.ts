"use client";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import ProgressCircle from "../ProgressCircle";
import { Button } from "../ui/button";
import { twMerge } from "tailwind-merge";
import { useAccount, useBalance, useWalletClient } from "wagmi";
import { Noun } from "@nouns/data/noun/types";
import Icon from "../ui/Icon";
import { getBuyNounOnSecondaryPayload } from "@nouns/data/noun/getBuyNounOnSecondaryPayload";
import { useQuery } from "@tanstack/react-query";
import ConvertNounGraphic from "../ConvertNounGraphic";
import { formatNumber } from "@nouns/utils/format";
import { formatEther } from "viem";
import { CHAIN_CONFIG, reservoirClient } from "@nouns/config";
import { APIError, Execute } from "@reservoir0x/reservoir-sdk";
import { useSwitchChainCustom } from "@nouns/hooks/useSwitchChainCustom";
import LoadingSpinner from "../LoadingSpinner";
import { TransactionListenerContext } from "@nouns/providers/TransactionListener";
import { useRouter } from "next/navigation";
import { revalidateSecondaryNounListings } from "@nouns/data/noun/getSecondaryNounListings";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogContentInner,
  DrawerDialogTrigger,
} from "@nouns/components/ui/DrawerDialog";
import { useModal } from "connectkit";

interface BuyOnSecondaryDialogProps {
  noun: Noun;
}

export default function BuyNounOnSecondaryDialog({
  noun,
}: BuyOnSecondaryDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<0 | 1>(0);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChainCustom();
  const { setOpen: setOpenConnectModal } = useModal();
  const [error, setError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState<boolean>(false);
  const router = useRouter();
  const { addTransaction } = useContext(TransactionListenerContext);

  const { data: secondaryListingData } = useQuery({
    queryKey: [
      "getBuyNounOnSecondaryPayload",
      noun.secondaryListing?.orderId,
      address,
    ],
    queryFn: () =>
      getBuyNounOnSecondaryPayload(noun.secondaryListing!.orderId, address!),
    enabled: address != undefined && noun.secondaryListing != null,
  });

  const { data: balanceData } = useBalance({ address });
  const insufficientFunds = useMemo(() => {
    if (
      noun.secondaryListing?.priceRaw == undefined ||
      balanceData == undefined
    ) {
      return false;
    } else {
      return balanceData.value < BigInt(noun.secondaryListing.priceRaw);
    }
  }, [balanceData, noun]);

  useEffect(() => {
    if (secondaryListingData) {
      setStep(secondaryListingData.step == "sign-in" ? 0 : 1);
    }
  }, [secondaryListingData]);

  const executePurchaseStep = useCallback(async () => {
    if (!address || !walletClient) {
      setOpenConnectModal(true);
    } else if (noun.secondaryListing) {
      // Call all the time
      const correctChain = await switchChain({
        chainId: CHAIN_CONFIG.chain.id,
      });
      if (!correctChain) return;

      // Trigger reservoir steps
      try {
        await reservoirClient.actions.buyToken({
          items: [{ orderId: noun.secondaryListing.orderId }],
          wallet: walletClient,
          options: {
            skipBalanceCheck: true,
          },
          onProgress: (steps: Execute["steps"]) => {
            setPending(true);

            const firstStep = steps.length > 0 ? steps[0] : undefined;
            const secondStep = steps.length > 1 ? steps[1] : undefined;

            const authStep = firstStep?.id == "auth" ? firstStep : undefined;
            const purchaseStep =
              firstStep?.id == "auth" ? secondStep : firstStep;

            if (
              step == 0 &&
              (!authStep || authStep?.items?.[0].status == "complete")
            ) {
              setStep(1);
              setPending(false);
            }

            if (purchaseStep?.items?.[0].txHashes?.[0].txHash) {
              const hash = purchaseStep.items[0].txHashes[0].txHash;
              addTransaction?.(
                hash,
                {
                  type: "secondary-purchase",
                  description: `Purchase Noun ${noun.id}`,
                },
                () => {
                  setPending(false);
                  revalidateSecondaryNounListings();
                  router.push(`/success/${hash}/purchase/${noun.id}`);
                },
              );
            }
          },
        });
      } catch (e) {
        setPending(false);
        console.error(`Reservoir error ${e}`);
        setError((e as APIError).message);
      }
    }
  }, [
    address,
    walletClient,
    setOpenConnectModal,
    noun.secondaryListing,
    step,
    addTransaction,
    noun.id,
    router,
    switchChain,
  ]);

  const progressStepper = useMemo(
    () => (
      <div className="flex w-full flex-col items-center justify-center gap-3 pt-3 text-content-secondary">
        {step != undefined && (
          <>
            <div className="flex w-full flex-row items-center justify-center gap-3 px-10 pb-8 paragraph-sm">
              <div className="relative">
                <ProgressCircle state={step == 0 ? "active" : "completed"} />
                <div className="absolute top-6 w-fit -translate-x-[calc(50%-6px)] whitespace-nowrap text-semantic-accent">
                  Sign In
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
                  Purchase
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    ),
    [step],
  );

  useEffect(() => {
    if (!open) {
      setError(undefined);
    }
  }, [open]);

  useEffect(() => {
    if (!address) {
      setStep(0);
    }
  }, [address]);

  const listing = noun.secondaryListing;
  if (!listing) {
    return null;
  }

  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogTrigger asChild>
        <Button className="w-full">
          <Icon icon="lightning" size={20} className="fill-white" />
          Buy Noun
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent
        className="md:max-h-[80vh] md:max-w-[425px]"
        ignoreOutsideInteractions
      >
        <DrawerDialogContentInner className="gap-6">
          <ConvertNounGraphic
            noun={noun}
            action="redeem"
            scale={1}
            asset="eth"
            amount={formatNumber({
              input: Number(formatEther(BigInt(listing.priceRaw))),
              unit: "Ξ",
            })}
          />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <h4>{step == 0 ? "Sign into marketplace" : "Confirm Purchase"}</h4>
            <span className="text-content-secondary">
              {step == 0
                ? `Before a purchase can be made, a message must be signed to sign into ${listing.marketName}.`
                : `This will purchase Noun ${noun.id} for ${formatNumber({ input: Number(formatEther(BigInt(listing.priceRaw ?? BigInt(0)))), unit: "ETH" })} on secondary.`}
            </span>
          </div>
          {progressStepper}
          <div className="flex w-full flex-col gap-1">
            <Button
              onClick={executePurchaseStep}
              className="w-full"
              disabled={insufficientFunds || pending}
            >
              {pending ? (
                <div>
                  <LoadingSpinner size={24} />
                </div>
              ) : step == 0 ? (
                "Sign In"
              ) : (
                "Purchase"
              )}
            </Button>
            <span className="max-h-[100px] overflow-y-auto text-semantic-negative paragraph-sm">
              {insufficientFunds ? "Insufficient Funds" : error}
            </span>
          </div>
        </DrawerDialogContentInner>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
