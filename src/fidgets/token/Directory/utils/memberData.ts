import { buildEtherscanUrl } from "@/common/data/api/token/utils";
import {
  extractNeynarPrimaryAddress,
  extractNeynarSocialAccounts,
} from "@/common/data/api/token/utils";
import type { DirectoryMemberData } from "../types";

/**
 * Type for Neynar user objects
 */
export type NeynarUser = {
  fid?: number | null;
  username?: string | null;
  display_name?: string | null;
  pfp_url?: string | null;
  follower_count?: number | null;
};

/**
 * Helper to normalize various user shapes coming from Neynar
 * Handles nested user objects (e.g., { user: { ... } })
 */
export function getNestedUser(u: any): NeynarUser | undefined {
  if (!u) return undefined;
  if (typeof u === "object" && u !== null) {
    if ("user" in u && u.user) return getNestedUser(u.user);
    return u as NeynarUser;
  }
  return undefined;
}

/**
 * Maps a Neynar user object to DirectoryMemberData
 */
export function mapNeynarUserToMember(u: NeynarUser): DirectoryMemberData {
  const primaryAddress = extractNeynarPrimaryAddress(u);
  const { xHandle: userXHandle, xUrl: userXUrl, githubHandle: userGithubHandle, githubUrl: userGithubUrl } =
    extractNeynarSocialAccounts(u);
  return {
    address: `fc_fid_${u.fid ?? Math.random().toString(36).slice(2)}`,
    balanceRaw: "0",
    balanceFormatted: "",
    username: u.username ?? undefined,
    displayName: u.display_name ?? undefined,
    fid: typeof u.fid === "number" ? u.fid : undefined,
    pfpUrl: u.pfp_url ?? undefined,
    followers: typeof u.follower_count === "number" ? u.follower_count : undefined,
    lastTransferAt: null,
    ensName: null,
    ensAvatarUrl: null,
    primaryAddress,
    etherscanUrl: buildEtherscanUrl(primaryAddress),
    xHandle: userXHandle,
    xUrl: userXUrl,
    githubHandle: userGithubHandle,
    githubUrl: userGithubUrl,
  };
}

/**
 * Creates a default DirectoryMemberData object for CSV entries
 */
export function createDefaultMemberForCsv(
  type: "address" | "fid" | "username",
  value: string
): DirectoryMemberData {
  if (type === "username") {
    const key = value.toLowerCase();
    return {
      address: `fc_username_${key}`,
      balanceRaw: "0",
      balanceFormatted: "",
      username: key,
      displayName: null,
      fid: null,
      pfpUrl: null,
      followers: null,
      lastTransferAt: null,
      ensName: null,
      ensAvatarUrl: null,
      primaryAddress: null,
      etherscanUrl: null,
      xHandle: null,
      xUrl: null,
      githubHandle: null,
      githubUrl: null,
    };
  }
  if (type === "fid") {
    const key = String(Number(value));
    return {
      address: `fc_fid_${key}`,
      balanceRaw: "0",
      balanceFormatted: "",
      username: null,
      displayName: null,
      fid: Number.isNaN(Number(key)) ? null : Number(key),
      pfpUrl: null,
      followers: null,
      lastTransferAt: null,
      ensName: null,
      ensAvatarUrl: null,
      primaryAddress: null,
      etherscanUrl: null,
      xHandle: null,
      xUrl: null,
      githubHandle: null,
      githubUrl: null,
    };
  }
  // address
  const key = value.toLowerCase();
  return {
    address: key,
    balanceRaw: "0",
    balanceFormatted: "",
    username: null,
    displayName: null,
    fid: null,
    pfpUrl: null,
    followers: null,
    lastTransferAt: null,
    ensName: null,
    ensAvatarUrl: null,
    primaryAddress: key,
    etherscanUrl: buildEtherscanUrl(key),
    xHandle: null,
    xUrl: null,
    githubHandle: null,
    githubUrl: null,
  };
}

