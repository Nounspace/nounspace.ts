import { Address, Hex } from "viem";

export interface MinimalTransactionRequest {
  to: Address;
  data: Hex;
  value: bigint;
  gasFallback: bigint; // Upper bound fallback for the gas required for the action, only used when estimation fails
}

export class CustomTransactionValidationError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

export type TransactionState =
  | "idle"
  | "pending-signature"
  | "pending-txn"
  | "success"
  | "failed";

export type TransactionType =
  | "approve-erc20"
  | "approve-noun"
  | "create-bid"
  | "create-swap-prop"
  | "nouns-deposit"
  | "nouns-redeem"
  | "nouns-swap"
  | "settle-auction"
  | "secondary-purchase"
  | "cast-vote";
