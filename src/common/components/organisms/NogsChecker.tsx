import { useAppStore } from "@/common/data/stores/app";
import { RECHECK_INITIAL_TIME } from "@/common/data/stores/app/setup";
import React from "react";
import { Button } from "../atoms/button";

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

  // TO DO: Add place to mint nOGs here
  return (
    <>
      <p className="mb-2">
        To customize a Space and Homebase, you must hold a nOGs NFT. Mint a pair{" "}
        <a
          href="https://highlight.xyz/mint/663d2717dffb7b3a490f398f"
          rel="noopener noreferrer"
          target="_blank"
          className="cursor-pointer text-blue-500 text-font-medium hover:underline hover:text-blue-500/70"
        >
          here
        </a>
        , then try again.
      </p>
      <Button disabled={isChecking} onClick={userTriggeredRecheck}>
        {isChecking ? "Checking if you have nOGs" : "Check now?"}
      </Button>

      <div
        className="mt-2"
        dangerouslySetInnerHTML={{
          __html: `
        <link rel="stylesheet" href="https://mint.highlight.xyz/assets/embed.css" />
        <div data-widget="highlight-mint-card" data-mint-collection-id="663d2717dffb7b3a490f398f"></div>
        <script type="module" crossorigin="true" src="https://mint.highlight.xyz/assets/embed.js?v=1"></script>
      `,
        }}
      />
    </>
  );
}
