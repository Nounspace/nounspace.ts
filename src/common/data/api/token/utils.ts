export const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/i;
export const NEYNAR_LOOKUP_BATCH_SIZE = 25;

/**
 * Normalizes an Ethereum address to lowercase
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * Checks if a string is a valid Ethereum address
 */
export function isAddress(value: string): boolean {
  return ADDRESS_REGEX.test(value);
}

/**
 * Extracts the owner address from a token holder record
 */
export function extractOwnerAddress(holder: { ownerAddress?: string | null }): string | null {
  if (typeof holder.ownerAddress === "string" && holder.ownerAddress) {
    return holder.ownerAddress;
  }
  return null;
}

/**
 * Parses a balance value string to BigInt
 */
export function parseBalanceValue(value: string | null | undefined): bigint {
  if (!value) {
    return 0n;
  }

  try {
    return BigInt(value);
  } catch (error) {
    console.error("Unable to parse token balance", value, error);
    return 0n;
  }
}

/**
 * Extracts and sums token balances from a holder record
 */
export function extractOwnerBalanceRaw(holder: {
  tokenBalances?: Array<{ balance?: string | null }> | null;
}): string {
  if (!Array.isArray(holder.tokenBalances) || holder.tokenBalances.length === 0) {
    return "0";
  }

  const total = holder.tokenBalances.reduce((sum, tokenBalance) => {
    return sum + parseBalanceValue(tokenBalance?.balance ?? null);
  }, 0n);

  return total.toString();
}

/**
 * Parses social media handles from ENS records or URLs
 */
export function parseSocialRecord(
  value: unknown,
  platform: "twitter" | "github",
): { handle: string; url: string } | null {
  if (typeof value !== "string") {
    return null;
  }

  let handle = value.trim();
  if (!handle) {
    return null;
  }

  const patterns =
    platform === "twitter"
      ? [
          /^https?:\/\/(www\.)?twitter\.com\//i,
          /^https?:\/\/(www\.)?x\.com\//i,
        ]
      : [/^https?:\/\/(www\.)?github\.com\//i];

  for (const pattern of patterns) {
    handle = handle.replace(pattern, "");
  }

  handle = handle.replace(/^@/, "");
  handle = handle.replace(/\/+$/, "");

  if (!handle) {
    return null;
  }

  const url =
    platform === "twitter"
      ? `https://twitter.com/${handle}`
      : `https://github.com/${handle}`;

  return { handle, url };
}

/**
 * Gets Moralis chain identifier (hex format)
 */
export function getMoralisChain(network: "base" | "polygon" | "mainnet"): string {
  switch (network) {
    case "mainnet":
      return "0x1";
    case "polygon":
      return "0x89";
    case "base":
      return "0x2105";
    default:
      return "0x1";
  }
}

/**
 * Gets fallback chain identifiers for Moralis (tries both hex and named)
 */
export function getMoralisChainFallbacks(
  network: "base" | "polygon" | "mainnet",
): string[] {
  switch (network) {
    case "mainnet":
      return ["0x1", "eth"];
    case "polygon":
      return ["0x89", "polygon"];
    case "base":
      return ["0x2105", "base"];
    default:
      return ["0x1", "eth"];
  }
}

