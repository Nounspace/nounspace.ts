"use client";
import {
  AbiFunction,
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  toFunctionSignature,
} from "viem";
import { erc20TokenAbi } from "@nouns/abis/erc20Token";
import { formatTokenAmount } from "@nouns/utils/utils";
import { NATIVE_ASSET_DECIMALS } from "@nouns/utils/constants";
import { nounsDaoDataAbi } from "@nouns/abis/nounsDaoData";
import { Noun } from "@nouns/data/noun/types";
import {
  UseSendTransactionReturnType,
  useSendTransaction,
} from "./useSendTransaction";
import { CHAIN_CONFIG } from "@nouns/config";
import { nounsTokenAbi } from "@nouns/abis/nounsToken";
import { useCallback } from "react";

interface GovernanceProposalTransaction {
  target: Address;
  value: bigint;
  functionSignature: string;
  inputData: `0x${string}`;
}

interface UseCreateSwapPropCandidateReturnType
  extends Omit<UseSendTransactionReturnType, "sendTransaction"> {
  createCandidate: (
    userNoun: Noun,
    treasuryNoun: Noun,
    tip: bigint,
    reason: string,
  ) => void;
}

export function useCreateSwapPropCandidate(): UseCreateSwapPropCandidateReturnType {
  const { sendTransaction, ...other } = useSendTransaction();

  const createCandidate = useCallback(
    (userNoun: Noun, treasuryNoun: Noun, tip: bigint, reason: string) => {
      const transferNounFromAbi = nounsTokenAbi.find(
        (entry) => entry.type == "function" && entry.name == "transferFrom",
      )! as AbiFunction;
      const safeTransferNounFromAbi = nounsTokenAbi.find(
        (entry) => entry.type == "function" && entry.name == "safeTransferFrom",
      )! as AbiFunction;
      const erc20TransferFromAbi = erc20TokenAbi.find(
        (entry) => entry.type == "function" && entry.name == "transferFrom",
      )! as AbiFunction;

      const userNounToTreasuryTransferFromInputData = encodeAbiParameters(
        transferNounFromAbi.inputs, // from: address, to: address, tokenId: uint256
        [
          userNoun.owner,
          CHAIN_CONFIG.addresses.nounsTreasury,
          BigInt(userNoun.id),
        ],
      );

      const wethTransferToTreasuryInputData = encodeAbiParameters(
        erc20TransferFromAbi.inputs,
        [userNoun.owner, CHAIN_CONFIG.addresses.nounsTreasury, tip],
      );

      const treasuryNounToUserSafeTransferFromInputData = encodeAbiParameters(
        safeTransferNounFromAbi.inputs, // from: address, to: address, tokenId: uint256
        [
          CHAIN_CONFIG.addresses.nounsTreasury,
          userNoun.owner,
          BigInt(treasuryNoun.id),
        ],
      );

      const transferUserNounGovTxn: GovernanceProposalTransaction = {
        target: CHAIN_CONFIG.addresses.nounsToken,
        value: BigInt(0),
        functionSignature: toFunctionSignature(transferNounFromAbi),
        inputData: userNounToTreasuryTransferFromInputData,
      };

      const transferWethGovTxn: GovernanceProposalTransaction = {
        target: CHAIN_CONFIG.addresses.wrappedNativeToken,
        value: BigInt(0),
        functionSignature: toFunctionSignature(erc20TransferFromAbi),
        inputData: wethTransferToTreasuryInputData,
      };

      const transferTreasuryNounGovTxn: GovernanceProposalTransaction = {
        target: CHAIN_CONFIG.addresses.nounsToken,
        value: BigInt(0),
        functionSignature: toFunctionSignature(safeTransferNounFromAbi),
        inputData: treasuryNounToUserSafeTransferFromInputData,
      };

      let govTxns: GovernanceProposalTransaction[] = [];
      if (tip > 0) {
        govTxns = [
          transferUserNounGovTxn,
          transferWethGovTxn,
          transferTreasuryNounGovTxn,
        ];
      } else {
        // Exclude the WETH transfer all together if the tip is 0
        govTxns = [transferUserNounGovTxn, transferTreasuryNounGovTxn];
      }

      const propTitle = `Nouns.com: Swap Noun ${userNoun.id} for Noun ${treasuryNoun.id}`;

      const proposeArgs: any = [
        govTxns.map((txn) => txn.target), // targets
        govTxns.map((txn) => txn.value), // values
        govTxns.map((txn) => txn.functionSignature), // signatures
        govTxns.map((txn) => txn.inputData), // input data
        `# ${propTitle}

## Summary

This proposal seeks to swap **Noun ${userNoun.id}${
          tip > BigInt(0)
            ? ` + ${formatTokenAmount(tip, NATIVE_ASSET_DECIMALS, 6)} WETH`
            : ""
        }** for **Noun ${treasuryNoun.id}** from the Nouns DAO treasury.

Noun ${userNoun.id}
![Noun ${userNoun.id}](https://noun-api.com/beta/pfp?background=${userNoun.traits.background.seed}&body=${
          userNoun.traits.body.seed
        }&accessory=${userNoun.traits.accessory.seed}&head=${userNoun.traits.head.seed}&glasses=${userNoun.traits.glasses.seed}&size=200)

Noun ${treasuryNoun.id}
![Noun ${treasuryNoun.id}](https://noun-api.com/beta/pfp?background=${treasuryNoun.traits.background.seed}&body=${
          treasuryNoun.traits.body.seed
        }&accessory=${treasuryNoun.traits.accessory.seed}&head=${treasuryNoun.traits.head.seed}&glasses=${
          treasuryNoun.traits.glasses.seed
        }&size=200)

---

## Rationale for Swap 

${reason ?? "No rationale provided"}

---

## This Prop was created using Nouns.com.

[Nouns.com](nouns.com) is a tool built for the Nouns community by [Paperclip Labs](https://paperclip.xyz/). It allows Noun owners to easily create proposals to swap their Noun for a Noun in the DAO treasury.`,
      ];

      const slug = propTitle
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

      // Candidate requires slug and proposalIdToUpdate
      proposeArgs.push(slug);
      proposeArgs.push(BigInt(0));

      const propCalldata = encodeFunctionData({
        abi: nounsDaoDataAbi,
        functionName: "createProposalCandidate",
        args: proposeArgs,
      });

      const request = {
        to: CHAIN_CONFIG.addresses.nounsDoaDataProxy,
        data: propCalldata,
        value: BigInt(0),
        gasFallback: BigInt(2000000), // Reasonable default incase gas estimate fails...
      };

      sendTransaction(request, {
        type: "create-swap-prop",
        description: "Create candidate",
      });
    },
    [sendTransaction],
  );

  return { createCandidate, ...other };
}
