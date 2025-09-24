import {
  Address,
  BaseError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from "viem";
import { SendTransactionErrorType } from "wagmi/actions";
import {
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MONTH,
  SECONDS_PER_YEAR,
} from "./constants";

export function formatAddress(address: Address, amount: number = 4): string {
  return `${address.slice(0, amount + 2)}...${address?.slice(address.length - amount, address.length)}`;
}

export function formatTimeLeft(seconds: number, compact?: boolean): string {
  const days = Math.floor(seconds / SECONDS_PER_DAY);
  const hours = Math.floor((seconds % SECONDS_PER_DAY) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const daysString = days > 0 ? days.toString() + "d " : "";
  const hoursString = hours > 0 ? hours.toString() + "h " : "";
  const minsString = mins > 0 ? mins.toString() + "m " : "";
  const secsString = secs + "s";

  if (compact) {
    if (days > 0) {
      return daysString;
    } else if (hours > 0) {
      return hoursString;
    } else if (mins > 0) {
      return minsString;
    } else {
      return secsString;
    }
  } else {
    return daysString + hoursString + minsString + secsString;
  }
}

export function formatSendTransactionError(
  error: SendTransactionErrorType | null,
) {
  if (error === null) return "";

  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof InsufficientFundsError)) {
      return "Wallet has insufficient balance.";
    } else if (
      error.walk((e) => e instanceof UserRejectedRequestError) ||
      error.details.includes("User rejected")
    ) {
      return "User rejected transaction request.";
    } else {
      return "Unknown error ocurred";
    }
  } else {
    return "Unknown error ocurred";
  }
}

export function capitalizeFirstLetterOfEveryWord(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

type FormatNumberParams = {
  input: number | bigint;
  compact?: boolean;
  maxFractionDigits?: number;
  maxSignificantDigits?: number;
  forceSign?: boolean;
  percent?: boolean;
  unit?: "USD" | string;
};

export function formatNumber({
  input,
  compact,
  maxFractionDigits,
  maxSignificantDigits,
  forceSign,
  percent,
  unit,
}: FormatNumberParams): string {
  const prefix = unit ? (unit == "USD" ? "$" : unit == "Ξ" ? "Ξ" : "") : "";
  const postfix = unit ? (unit != "USD" && unit != "Ξ" ? ` ${unit}` : "") : "";
  const formattedNumber = Intl.NumberFormat("en", {
    notation:
      (input > 9999 || input < -9999) && compact ? "compact" : "standard",
    maximumFractionDigits: maxFractionDigits ?? 2,
    maximumSignificantDigits: maxSignificantDigits,
    style: percent ? "percent" : "decimal",
    signDisplay: forceSign ? "exceptZero" : "auto",
  }).format(input);
  return (
    (input < 0 ? "-" : "") + prefix + formattedNumber.replace("-", "") + postfix
  );
}

interface FormatTimestampParams {
  timestamp: number;
  showMonth?: boolean;
  showDay?: boolean;
  showTime?: boolean;
}

export function formatTimestamp({
  timestamp,
  showMonth,
  showDay,
  showTime,
}: FormatTimestampParams) {
  return Intl.DateTimeFormat("en", {
    day: showDay ? "numeric" : undefined,
    month: showMonth ? "short" : undefined,
    hour: showTime ? "numeric" : undefined,
    minute: showTime ? "numeric" : undefined,
    second: showTime ? "numeric" : undefined,
  }).format(timestamp);
}

export function formatTimeSinceNow(timestamp: number) {
  const now = new Date();
  const timestampDate = new Date(timestamp * 1000);

  const deltaS = (now.getTime() - timestampDate.getTime()) / 1000;

  let val;

  const years = Math.floor(deltaS / SECONDS_PER_YEAR);
  if (years > 0) {
    val = years + "y";
  } else {
    const days = Math.floor(deltaS / SECONDS_PER_DAY);
    if (days > 0) {
      val = days + "d";
    } else {
      const hours = Math.floor(deltaS / SECONDS_PER_HOUR);
      if (hours > 0) {
        val = hours + "h";
      } else {
        const minutes = Math.floor(deltaS / 60);
        val = minutes + "m";
      }
    }
  }

  return val;
}
