import { formatEther } from "viem";
import type { Auction } from "./types";

export const formatEth = (value: bigint, fractionDigits = 2) => {
  if (!value) return "0 ETH";
  const asNumber = Number(formatEther(value));
  if (asNumber >= 1) {
    return `${asNumber.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: fractionDigits,
    })} ETH`;
  }
  return `${formatEther(value)} ETH`;
};

export const shortAddress = (address?: string) => {
  if (!address) return "Unknown";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getAuctionStatus = (auction?: Auction): "loading" | "pending" | "active" | "ended" => {
  if (!auction) return "loading";
  const now = Date.now();
  if (Number(auction.startTime) * 1000 > now) return "pending";
  if (Number(auction.endTime) * 1000 <= now) return "ended";
  return "active";
};

export const formatCountdown = (targetMs: number) => {
  if (targetMs <= 0) return "00:00";
  const totalSeconds = Math.max(0, Math.floor(targetMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hh = hours > 0 ? `${hours.toString().padStart(2, "0")}:` : "";
  return `${hh}${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};
