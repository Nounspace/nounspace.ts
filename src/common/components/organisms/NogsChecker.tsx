import { useAppStore } from "@/common/data/stores/app";
import { SetupStep } from "@/common/data/stores/app/setup";
import { NOGS_CONTRACT_ADDR } from "@/constants/nogs";
import { ALCHEMY_API } from "@/constants/urls";
import { AlchemyIsHolderOfContract } from "@/pages/api/signerRequests";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "../atoms/button";

const RECHECK_BACKOFF_FACTOR = 2;
const RECHECK_INITIAL_TIME = 2000;

export default function NogsChecker() {
  const { authenticated, user, ready: privyReady } = usePrivy();
  const { setCurrentStep } = useAppStore((state) => ({
    setCurrentStep: state.setup.setCurrentStep,
  }));
  const [recheckTimerLength, setRecheckTimerLength] =
    useState(RECHECK_INITIAL_TIME);
  const [timeoutTimer, setTimeoutTimer] =
    useState<ReturnType<typeof setTimeout>>();
  const [isChecking, setIsChecking] = useState(false);
  const [recheckCountDown, setRecheckCountDown] = useState(0);
  const [recheckCountDownTimer, setRecheckCountDownTimer] =
    useState<ReturnType<typeof setTimeout>>();
  const [shouldRecheck, setShouldRecheck] = useState(false);

  async function isHoldingNogs(address): Promise<boolean> {
    setIsChecking(true);
    if (process.env.NODE_ENV === "development") {
      setIsChecking(false);
      return true;
    }
    try {
      const { data } = await axios.get<AlchemyIsHolderOfContract>(
        `${ALCHEMY_API("base")}nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/isHolderOfContract`,
        {
          params: {
            wallet: address,
            contractAddress: NOGS_CONTRACT_ADDR,
          },
        },
      );
      return data.isHolderOfContract;
    } catch {
      return false;
    } finally {
      setIsChecking(false);
    }
  }

  async function checkForNogs() {
    clearTimeout(timeoutTimer);
    clearTimeout(recheckCountDownTimer);
    setRecheckCountDown(0);
    setShouldRecheck(false);
    if (user && user.wallet) {
      if (await isHoldingNogs(user.wallet.address))
        setCurrentStep(SetupStep.TOKENS_FOUND);
      else {
        setRecheckTimerLength(recheckTimerLength * RECHECK_BACKOFF_FACTOR);
        setTimeoutTimer(
          setTimeout(() => setShouldRecheck(true), recheckTimerLength),
        );
        setRecheckCountDown(recheckTimerLength / 1000);
      }
    }
  }

  async function userTriggeredRecheck() {
    setRecheckTimerLength(RECHECK_INITIAL_TIME);
    setShouldRecheck(true);
  }

  useEffect(() => {
    shouldRecheck && checkForNogs();
  }, [shouldRecheck]);

  useEffect(() => {
    if (recheckCountDown > 0) {
      setRecheckCountDownTimer(
        setTimeout(() => setRecheckCountDown(recheckCountDown - 1), 1000),
      );
    }
  }, [recheckCountDown]);

  useEffect(() => {
    if (authenticated && privyReady) {
      checkForNogs();
    }
  }, [authenticated, privyReady]);

  // TO DO: Add place to mint nOGs here
  return (
    <>
      Waiting to see if you have gotten nOG&apos;d... Checking again in{" "}
      {recheckCountDown} seconds
      <Button disabled={isChecking} onClick={userTriggeredRecheck}>
        {isChecking ? "Checking if you have nOGs" : "Check now?"}
      </Button>
    </>
  );
}
