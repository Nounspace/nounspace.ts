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

/**
 * Extracts primary Ethereum address from Neynar user object
 * Checks multiple possible locations in the user object
 */
export function extractNeynarPrimaryAddress(user: any): string | null {
  if (!user || typeof user !== "object") return null;
  
  const verified = (user as { verified_addresses?: any }).verified_addresses;
  if (verified && typeof verified === "object") {
    const primary = verified.primary;
    if (primary && typeof primary.eth_address === "string" && primary.eth_address) {
      return normalizeAddress(primary.eth_address);
    }
    if (Array.isArray(verified.eth_addresses)) {
      const candidate = verified.eth_addresses.find(
        (value: unknown): value is string =>
          typeof value === "string" && value.length > 0,
      );
      if (candidate) {
        return normalizeAddress(candidate);
      }
    }
  }
  
  const custody = (user as { custody_address?: string | null }).custody_address;
  if (typeof custody === "string" && custody) {
    return normalizeAddress(custody);
  }
  
  const verifications = (user as { verifications?: string[] }).verifications;
  if (Array.isArray(verifications)) {
    const candidate = verifications.find(
      (value): value is string => typeof value === "string" && value.length > 0,
    );
    if (candidate) {
      return normalizeAddress(candidate);
    }
  }
  
  const authAddresses = (user as { auth_addresses?: Array<{ address?: string }> }).auth_addresses;
  if (Array.isArray(authAddresses)) {
    const entry = authAddresses.find(
      (item) => item && typeof item.address === "string" && item.address.length > 0,
    );
    if (entry?.address) {
      return normalizeAddress(entry.address);
    }
  }
  
  return null;
}

/**
 * Extracts social media accounts (X/Twitter and GitHub) from Neynar user object
 */
export function extractNeynarSocialAccounts(user: any): {
  xHandle: string | null;
  xUrl: string | null;
  githubHandle: string | null;
  githubUrl: string | null;
} {
  if (!user || typeof user !== "object") {
    return { xHandle: null, xUrl: null, githubHandle: null, githubUrl: null };
  }
  
  const verifiedAccounts = (user as { verified_accounts?: Array<any> }).verified_accounts;
  let xHandle: string | null = null;
  let xUrl: string | null = null;
  let githubHandle: string | null = null;
  let githubUrl: string | null = null;
  
  if (Array.isArray(verifiedAccounts)) {
    for (const account of verifiedAccounts) {
      const platform =
        typeof account?.platform === "string" ? account.platform.toLowerCase() : "";
      const username =
        typeof account?.username === "string" ? account.username.replace(/^@/, "").trim() : "";
      if (!username) continue;
      
      if (!xHandle && (platform === "x" || platform === "twitter")) {
        xHandle = username;
        xUrl = `https://twitter.com/${username}`;
      } else if (!githubHandle && platform === "github") {
        githubHandle = username;
        githubUrl = `https://github.com/${username}`;
      }
    }
  }
  
  return { xHandle, xUrl, githubHandle, githubUrl };
}

/**
 * Builds Etherscan URL for an Ethereum address
 */
export function buildEtherscanUrl(address?: string | null): string | null {
  return address ? `https://etherscan.io/address/${normalizeAddress(address)}` : null;
}

/**
 * Block explorer base URLs by network
 */
export const BLOCK_EXPLORER_URLS: Record<"base" | "polygon" | "mainnet", string> = {
  mainnet: "https://etherscan.io/address/",
  base: "https://basescan.org/address/",
  polygon: "https://polygonscan.com/address/",
};

/**
 * Gets block explorer link for an address on a specific network
 */
export function getBlockExplorerLink(
  network: "base" | "polygon" | "mainnet",
  address: string
): string {
  return `${BLOCK_EXPLORER_URLS[network]}${normalizeAddress(address)}`;
}

