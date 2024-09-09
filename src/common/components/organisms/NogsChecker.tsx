import { useAppStore } from "@/common/data/stores/app";
import { RECHECK_INITIAL_TIME } from "@/common/data/stores/app/setup";
import React from "react";
import { Button } from "@/common/components/atoms/button";

export default function NogsChecker() {
  const { setRecheckTimerLength, setShouldRecheck, isChecking } = useAppStore(
    (state) => ({
      setRecheckTimerLength: state.setup.setNogsRecheckTimerLength,
      setShouldRecheck: state.setup.setNogsShouldRecheck,
      isChecking: state.setup.nogsIsChecking,
      recheckCountDown: state.setup.nogsRecheckCountDown,
    }),
  );

  async function userTriggeredRecheck() {
    setRecheckTimerLength(RECHECK_INITIAL_TIME);
    setShouldRecheck(true);
  }

  return (
    <>
      <p className="mb-2">
        Tabs are only for early supporters holding a nounspace OG NFT (nOGs){" "}
        <br />
        Mint a pair{" "}
        <a
          href="https://highlight.xyz/mint/663d2717dffb7b3a490f398f"
          rel="noopener noreferrer"
          target="_blank"
          className="cursor-pointer text-blue-500 text-font-medium hover:underline hover:text-blue-500/70"
        >
          here
        </a>
        , then try again!
      </p>
      <Button disabled={isChecking} onClick={userTriggeredRecheck}>
        {isChecking ? "Checking if you have nOGs" : "Check my nOGs!"}
      </Button>
    </>
  );
}
