import { getAddress } from "viem";

export const NATIVE_ASSET_DECIMALS = 18;

export const SECONDS_PER_HOUR = 60 * 60;
export const SECONDS_PER_DAY = SECONDS_PER_HOUR * 24;
export const SECONDS_PER_WEEK = SECONDS_PER_DAY * 7;
export const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;
export const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365;

export const CLIENT_ID = 5;

export const NNS_ENS_MAINNET_RESOLVER_ADDRESS = getAddress("0x849F92178950f6254db5D16D1ba265E70521aC1B");

export const FRAME_SERVER_URL = "https://www.frames.paperclip.xyz/nounswap";
