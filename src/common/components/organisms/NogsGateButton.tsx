import React, { useState, useCallback } from "react";
import { useAppStore } from "@/common/data/stores/app";
import { RECHECK_BACKOFF_FACTOR } from "@/common/data/stores/app/setup";
import { NOGS_CONTRACT_ADDR } from "@/constants/nogs";
import { ALCHEMY_API } from "@/constants/urls";
import { AlchemyIsHolderOfContract } from "@/pages/api/signerRequests";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { useEffect } from "react";
import { Button, ButtonProps } from "../atoms/button";
import NogsChecker from "./NogsChecker";
import Modal from "../molecules/Modal";
import { isUndefined } from "lodash";
import { useBalance } from "wagmi";
import { Address, formatUnits, zeroAddress } from "viem";
import { base } from "viem/chains";
import { SPACE_CONTRACT_ADDR } from "@/constants/spaceToken";

const NogsGateButton = (props: ButtonProps) => {
  const { user } = usePrivy();
  const {
    setNogsIsChecking,
    nogsTimeoutTimer,
    nogsRecheckCountDownTimer,
    setNogsRecheckCountDown,
    setNogsShouldRecheck,
    setNogsRecheckTimerLength,
    nogsRecheckTimerLength,
    setNogsTimeoutTimer,
    nogsRecheckCountDown,
    setNogsRecheckCountDownTimer,
    nogsShouldRecheck,
    hasNogs,
    setHasNogs,
  } = useAppStore((state) => ({
    setNogsIsChecking: state.setup.setNogsIsChecking,
    nogsTimeoutTimer: state.setup.nogsTimeoutTimer,
    nogsRecheckCountDownTimer: state.setup.nogsRecheckCountDownTimer,
    setNogsRecheckCountDown: state.setup.setNogsRecheckCountDown,
    setNogsShouldRecheck: state.setup.setNogsShouldRecheck,
    setNogsRecheckTimerLength: state.setup.setNogsRecheckTimerLength,
    nogsRecheckTimerLength: state.setup.nogsRecheckTimerLength,
    setNogsTimeoutTimer: state.setup.setNogsTimeoutTimer,
    nogsRecheckCountDown: state.setup.nogsRecheckCountDown,
    setNogsRecheckCountDownTimer: state.setup.setNogsRecheckCountDownTimer,
    nogsShouldRecheck: state.setup.nogsShouldRecheck,
    hasNogs: state.account.hasNogs,
    setHasNogs: state.account.setHasNogs,
  }));

  const [modalOpen, setModalOpen] = useState(false);

  async function isHoldingNogs(address): Promise<boolean> {
    setNogsIsChecking(true);
    if (process.env.NODE_ENV === "development") {
      setNogsIsChecking(false);
      return true;
    }
    try {
     console.log("[DEBUG] Checking nOGs for address:", address); 
     console.log("[DEBUG] Using API:", `${ALCHEMY_API("base")}nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/isHolderOfContract`); 
     console.log("[DEBUG] nOGs Contract:", NOGS_CONTRACT_ADDR);
      const { data } = await axios.get<AlchemyIsHolderOfContract>(
        `${ALCHEMY_API("base")}nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/isHolderOfContract`,
        {
          params: {
            wallet: address,
            contractAddress: NOGS_CONTRACT_ADDR,
          },
        },
      );
      console.log("[DEBUG] API response for nOGs:", data);
      return data.isHolderOfContract;
    } catch (err) {
      console.error("[DEBUG] Error checking nOGs:", err);
      return false;
    } finally {
      setNogsIsChecking(false);
    }
  }

  const checkForNogs = useCallback(async () => {
    clearTimeout(nogsTimeoutTimer);
    clearTimeout(nogsRecheckCountDownTimer);
    setNogsRecheckCountDown(0);
    setNogsShouldRecheck(false);
    if (user && user.wallet) {
      if (await isHoldingNogs(user.wallet.address)) {
        setHasNogs(true);
        setModalOpen(false);
      } else {
        setNogsRecheckTimerLength(
          nogsRecheckTimerLength * RECHECK_BACKOFF_FACTOR,
        );
        setNogsTimeoutTimer(
          setTimeout(() => setNogsShouldRecheck(true), nogsRecheckTimerLength),
        );
        setNogsRecheckCountDown(nogsRecheckTimerLength / 1000);
      }
    }
  }, [
    user,
    setModalOpen,
    nogsRecheckTimerLength,
    setNogsRecheckTimerLength,
    setNogsTimeoutTimer,
    setNogsRecheckCountDown,
    setNogsShouldRecheck,
    setHasNogs,
  ]);

  useEffect(() => {
    if (nogsRecheckCountDown > 0) {
      const timer = setTimeout(
        () => setNogsRecheckCountDown(nogsRecheckCountDown - 1),
        1000,
      );
      setNogsRecheckCountDownTimer(timer);
      
      // Cleanup function to clear timer when component unmounts or effect re-runs
      return () => {
        clearTimeout(timer);
      };
    }
  }, [nogsRecheckCountDown]);

  useEffect(() => {
    nogsShouldRecheck && checkForNogs();
  }, [nogsShouldRecheck, checkForNogs]);

  // Cleanup effect to clear all timers when component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(nogsTimeoutTimer);
      clearTimeout(nogsRecheckCountDownTimer);
    };
  }, []);

  const isClient = typeof window !== "undefined";
  const walletAddress = isClient ? (user?.wallet?.address as Address | undefined) : undefined;

  const { data: spaceBalanceData } = isClient
    ? useBalance({
        address: walletAddress ?? zeroAddress,
        token: SPACE_CONTRACT_ADDR as `0x${string}`,
        chainId: base.id,
        query: { enabled: Boolean(walletAddress) },
      })
    : { data: undefined };

  useEffect(() => {
    if (spaceBalanceData) {
      console.log("[DEBUG] SPACE balance:", Number(formatUnits(spaceBalanceData.value, spaceBalanceData.decimals)));
      console.log("[DEBUG] SPACE contract address:", SPACE_CONTRACT_ADDR);
      console.log("[DEBUG] Connected wallet:", walletAddress);
    }
  }, [spaceBalanceData, walletAddress]);

  const MIN_SPACE_TOKENS_FOR_UNLOCK = 1111;
  const userHoldEnoughSpace = spaceBalanceData
    ? Number(formatUnits(spaceBalanceData.value, spaceBalanceData.decimals)) >= MIN_SPACE_TOKENS_FOR_UNLOCK
    : false;

  useEffect(() => {
    console.log("[DEBUG] userHoldEnoughSpace:", userHoldEnoughSpace);
    console.log("[DEBUG] hasNogs:", hasNogs);
  }, [userHoldEnoughSpace, hasNogs]);
    
  // NFT nOGs debug status
  const [nogsCheckResult, setNogsCheckResult] = useState<string>("?");

    // Automatically check nOGs on load
  useEffect(() => {
    async function checkNogsAuto() {
      if (walletAddress) {
        try {
          const { data } = await axios.get(
            `${ALCHEMY_API("base")}nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/isHolderOfContract`,
            {
              params: {
                wallet: walletAddress,
                contractAddress: NOGS_CONTRACT_ADDR,
              },
            },
          );
          setNogsCheckResult(data.isHolderOfContract ? "YES" : "NO"); // debug: "YES" if present, "NO" if not present
          if (data.isHolderOfContract) setHasNogs(true); // Open the gate
        } catch {
         setNogsCheckResult("ERROR"); // debug: error in the request
        }
      }
    }
    checkNogsAuto();
  }, [walletAddress, NOGS_CONTRACT_ADDR]);

  return (
    <>
      <Modal setOpen={setModalOpen} open={modalOpen} showClose>
        <NogsChecker></NogsChecker>
      </Modal>
      <Button
        {...props}
        onClick={(e) =>
          (hasNogs || userHoldEnoughSpace)
            ? isUndefined(props.onClick)
              ? undefined
              : props.onClick(e)
            : setModalOpen(true)
        }
      ></Button>
    </>
  );
};

export default NogsGateButton;
