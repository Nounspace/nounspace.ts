import { twMerge } from "tailwind-merge";
import { CHAIN_CONFIG } from "@nouns/config";

export default function TestnetBanner() {
  return (
    <span
      className={twMerge(
        "hidden w-full bg-semantic-warning-light p-2 text-center",
        // CHAIN_CONFIG.chain.testnet && "block"
      )}
    >
      You are on {CHAIN_CONFIG.chain.name} Testnet.
    </span>
  );
}
