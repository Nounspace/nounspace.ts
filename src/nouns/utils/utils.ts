import { Address, formatUnits } from "viem";
import { formatNumber } from "./format";

export function getShortAddress(address: Address) {
  return address.slice(0, 6) + "..." + address.slice(address.length - 4);
}

export function getLinearGradientForAddress(address: Address) {
  const addr = address.slice(2, 10);
  const seed = parseInt(addr, 16);
  const number = Math.ceil(seed % 0xffffff);
  return `linear-gradient(45deg, #${number.toString(16).padStart(6, "0")}, #FFFFFF)`;
}

/**
 * Format a token amount in a human readable way
 * @param tokenAmount token balance (ex 1e6 for 1 USDC)
 * @param tokenDecimals number of decimals the token balances uses
 * @param decimalPrecision nunber of decimals to keep
 */
export function formatTokenAmount(tokenAmount?: bigint, tokenDecimals?: number, decimalPrecision?: number): string {
  const tokens =
    tokenAmount != undefined && tokenDecimals ? formatUnits(tokenAmount as bigint, tokenDecimals) : undefined;

  return formatNumber({ input: tokens ? Number(tokens) : 0, maxFractionDigits: decimalPrecision });
}
