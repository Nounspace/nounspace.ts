"use server";
import { CHAIN_CONFIG } from "@nouns/config";
import { safeFetch } from "@nouns/utils/safeFetch";
import { paths } from "@reservoir0x/reservoir-sdk";
import { Address, getAddress, Hex, TransactionRequest } from "viem";

type BuyOnSecondaryPayload =
  | {
      step: "sign-in";
    }
  | {
      step: "purchase";
      partialTx: {
        to: Address;
        data: Hex;
        value: bigint;
      };
    };

export async function getBuyNounOnSecondaryPayload(
  orderId: string,
  taker: Address,
): Promise<BuyOnSecondaryPayload | null> {
  const data = await safeFetch<
    paths["/execute/buy/v7"]["post"]["responses"]["200"]["schema"]
  >(`${CHAIN_CONFIG.reservoirApiUrl}/execute/buy/v7`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.RESERVOIR_API_KEY!,
    },
    body: JSON.stringify({
      taker,
      items: [
        {
          fillType: "trade",
          orderId,
        },
      ],
      skipBalanceCheck: true,
    }),
    next: {
      revalidate: 0,
    },
  });
  const steps = data?.steps;

  if (
    !data ||
    (data.errors && data.errors.length != 0) ||
    !steps ||
    steps.length === 0
  ) {
    console.error(
      `getBuyNounOnSecondaryPayload: error ${data?.errors}, steps: ${steps}`,
    );
    return null;
  }

  const firstStep = steps[0];

  if (firstStep.id == "sale") {
    const { to, value, data: calldata } = firstStep.items[0].data as any;
    if (!to || !value || !calldata) {
      console.error(
        `getBuyNounOnSecondaryPayload: missing payload data, ${to}, ${value}, ${calldata}`,
      );
      return null;
    }
    return {
      step: "purchase",
      partialTx: {
        to: getAddress(to),
        data: calldata as Hex,
        value: BigInt(value),
      },
    };
  } else if (firstStep.id == "auth") {
    // Will use reservoir sdk for this
    return {
      step: "sign-in",
    };
  } else {
    console.error(
      "getBuyNounOnSecondaryPayload: unexpected step",
      firstStep.id,
    );
    return null;
  }
}
