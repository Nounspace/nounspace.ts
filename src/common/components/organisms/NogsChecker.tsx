import { useAppStore } from "@/common/data/stores/app";
import { RECHECK_INITIAL_TIME } from "@/common/data/stores/app/setup";
import React from "react";
import { Button } from "../atoms/button";

export default function NogsChecker() {
  const {
    setRecheckTimerLength,
    setShouldRecheck,
    recheckCountDown,
    isChecking,
  } = useAppStore((state) => ({
    setRecheckTimerLength: state.setup.setNogsRecheckTimerLength,
    setShouldRecheck: state.setup.setNogsShouldRecheck,
    isChecking: state.setup.nogsIsChecking,
    recheckCountDown: state.setup.nogsRecheckCountDown,
  }));

  async function userTriggeredRecheck() {
    setRecheckTimerLength(RECHECK_INITIAL_TIME);
    setShouldRecheck(true);
  }

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
