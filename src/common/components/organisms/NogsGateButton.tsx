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
    nogsTimeoutTimer,
    nogsRecheckCountDownTimer,
    setNogsRecheckCountDown,
    setNogsShouldRecheck,
    user,
    setHasNogs,
    setModalOpen,
    setNogsRecheckTimerLength,
    nogsRecheckTimerLength,
    setNogsTimeoutTimer,
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
  }, [nogsRecheckCountDown, setNogsRecheckCountDown, setNogsRecheckCountDownTimer]);

  useEffect(() => {
    nogsShouldRecheck && checkForNogs();
  }, [nogsShouldRecheck, checkForNogs]);

  // Cleanup effect to clear all timers when component unmounts
  useEffect(() => {
    return () => {
      clearTimeout(nogsTimeoutTimer);
      clearTimeout(nogsRecheckCountDownTimer);
    };
  }, [nogsTimeoutTimer, nogsRecheckCountDownTimer]);

  return (
    <>
      <Modal setOpen={setModalOpen} open={modalOpen} showClose>
        <NogsChecker></NogsChecker>
      </Modal>
      <Button
        {...props}
        onClick={(e) =>
          hasNogs
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
