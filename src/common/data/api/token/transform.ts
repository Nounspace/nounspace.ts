import { formatUnits } from "viem";
import type {
  DirectoryMember,
  TokenHolder,
  NeynarUser,
  EnsMetadata,
} from "./types";
import {
  normalizeAddress,
  extractOwnerAddress,
  extractOwnerBalanceRaw,
} from "./utils";

type AggregatedMember = {
  sum: bigint;
  username?: string | null;
  displayName?: string | null;
  fid?: number | null;
  pfpUrl?: string | null;
  followers?: number | null;
  ensName?: string | null;
  ensAvatarUrl?: string | null;
  primaryAddress?: string | null;
  etherscanUrl?: string | null;
  xHandle?: string | null;
  xUrl?: string | null;
  githubHandle?: string | null;
  githubUrl?: string | null;
};

/**
 * Extracts profile data from Neynar user object
 */
function extractNeynarProfileData(profile: NeynarUser | undefined): {
  username: string | null;
  displayName: string | null;
  fid: number | null;
  followers: number | null;
  pfpUrl: string | null;
  xHandle: string | null;
  xUrl: string | null;
  githubHandle: string | null;
  githubUrl: string | null;
} {
  const username = profile && "username" in profile ? profile.username ?? null : null;
  const displayName =
    profile && "display_name" in profile
      ? (profile as { display_name?: string | null }).display_name ?? null
      : null;
  const fid = profile && "fid" in profile ? (profile as { fid?: number }).fid ?? null : null;
  const followers =
    profile && "follower_count" in profile
      ? (profile as { follower_count?: number | null }).follower_count ?? null
      : null;
  const pfpUrl =
    profile && typeof profile === "object" && profile !== null && "pfp_url" in profile
      ? (profile as { pfp_url?: string | null }).pfp_url ?? null
      : profile && typeof profile === "object" && profile !== null && "profile" in profile
        ? ((profile as { profile?: { pfp_url?: string | null } }).profile?.pfp_url ?? null)
        : null;

  let xHandleFromProfile: string | null = null;
  let xUrlFromProfile: string | null = null;
  let githubHandleFromProfile: string | null = null;
  let githubUrlFromProfile: string | null = null;
  const verifiedAccounts =
    profile && typeof profile === "object" && profile !== null && "verified_accounts" in profile
      ? (profile as { verified_accounts?: Array<any> }).verified_accounts
      : undefined;
  if (Array.isArray(verifiedAccounts)) {
    for (const account of verifiedAccounts) {
      const platform =
        typeof account?.platform === "string" ? account.platform.toLowerCase() : "";
      const usernameValue =
        typeof account?.username === "string" ? account.username.trim() : "";
      const normalizedUsername = usernameValue.replace(/^@/, "");
      if (!normalizedUsername) continue;
      if (!xHandleFromProfile && (platform === "x" || platform === "twitter")) {
        xHandleFromProfile = normalizedUsername;
        xUrlFromProfile = `https://twitter.com/${normalizedUsername}`;
      } else if (!githubHandleFromProfile && platform === "github") {
        githubHandleFromProfile = normalizedUsername;
        githubUrlFromProfile = `https://github.com/${normalizedUsername}`;
      }
    }
  }

  return {
    username,
    displayName,
    fid,
    followers,
    pfpUrl,
    xHandle: xHandleFromProfile,
    xUrl: xUrlFromProfile,
    githubHandle: githubHandleFromProfile,
    githubUrl: githubUrlFromProfile,
  };
}

/**
 * Extracts primary address from Neynar profile
 */
function extractPrimaryAddress(profile: NeynarUser | undefined): string | null {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  const verifiedAddresses =
    "verified_addresses" in profile
      ? (profile as {
          verified_addresses?: {
            primary?: { eth_address?: string | null } | null;
            eth_addresses?: Array<string | null> | null;
          };
        }).verified_addresses
      : undefined;

  if (verifiedAddresses && typeof verifiedAddresses === "object") {
    const primary = verifiedAddresses.primary;
    if (
      primary &&
      typeof primary === "object" &&
      typeof primary.eth_address === "string" &&
      primary.eth_address
    ) {
      return primary.eth_address;
    }
    if (!primary && Array.isArray(verifiedAddresses.eth_addresses)) {
      const candidate = verifiedAddresses.eth_addresses.find(
        (value): value is string => typeof value === "string" && value.length > 0,
      );
      if (candidate) {
        return candidate;
      }
    }
  }

  const custody = (profile as { custody_address?: string | null }).custody_address;
  if (typeof custody === "string" && custody) {
    return custody;
  }

  if (Array.isArray((profile as { verifications?: string[] }).verifications)) {
    const verification = (profile as { verifications?: string[] }).verifications?.find(
      (value): value is string => typeof value === "string" && value.length > 0,
    );
    if (verification) {
      return verification;
    }
  }

  if (Array.isArray((profile as { auth_addresses?: Array<{ address?: string }> }).auth_addresses)) {
    const authAddress = (profile as { auth_addresses?: Array<{ address?: string }> })
      .auth_addresses?.find(
        (entry) => entry && typeof entry.address === "string" && entry.address.length > 0,
      );
    if (authAddress?.address) {
      return authAddress.address;
    }
  }

  return null;
}

/**
 * Transforms and aggregates token holders into directory members
 */
export function transformAndAggregate(
  holders: TokenHolder[],
  neynarProfiles: Record<string, NeynarUser | undefined>,
  ensMetadata: Record<string, EnsMetadata>,
  tokenDecimals: number | null,
): DirectoryMember[] {
  const members: DirectoryMember[] = [];
  const byFid = new Map<number, AggregatedMember>();

  for (const holder of holders) {
    const address = extractOwnerAddress(holder);
    if (!address) {
      continue;
    }

    const key = normalizeAddress(address);
    const profile = neynarProfiles[key];
    const balanceRaw = extractOwnerBalanceRaw(holder);
    let balanceFormatted = balanceRaw;

    const ensInfo = ensMetadata[key];

    if (tokenDecimals !== null) {
      try {
        balanceFormatted = formatUnits(BigInt(balanceRaw), tokenDecimals);
      } catch (error) {
        console.error("Failed to format token balance", error);
      }
    }

    const profileData = extractNeynarProfileData(profile);
    const primaryAddressFromProfile = extractPrimaryAddress(profile);
    const normalizedPrimaryAddress = primaryAddressFromProfile
      ? normalizeAddress(primaryAddressFromProfile)
      : ensInfo?.primaryAddress
        ? normalizeAddress(ensInfo.primaryAddress)
        : null;
    const etherscanUrl = normalizedPrimaryAddress
      ? `https://etherscan.io/address/${normalizedPrimaryAddress}`
      : null;

    const ensTwitterHandle = ensInfo?.twitterHandle ?? null;
    const ensTwitterUrl =
      ensInfo?.twitterUrl ??
      (ensTwitterHandle ? `https://twitter.com/${ensTwitterHandle}` : null);
    const ensGithubHandle = ensInfo?.githubHandle ?? null;
    const ensGithubUrl =
      ensInfo?.githubUrl ??
      (ensGithubHandle ? `https://github.com/${ensGithubHandle}` : null);

    const combinedXHandle = profileData.xHandle ?? ensTwitterHandle ?? null;
    const combinedXUrl =
      profileData.xUrl ??
      ensTwitterUrl ??
      (combinedXHandle ? `https://twitter.com/${combinedXHandle}` : null);
    const combinedGithubHandle = profileData.githubHandle ?? ensGithubHandle ?? null;
    const combinedGithubUrl =
      profileData.githubUrl ??
      ensGithubUrl ??
      (combinedGithubHandle ? `https://github.com/${combinedGithubHandle}` : null);

    if (typeof profileData.fid === "number" && profileData.fid > 0) {
      const current = byFid.get(profileData.fid) ?? { sum: 0n };
      const fallbackAddressForAgg = normalizedPrimaryAddress ?? key;
      current.sum = current.sum + BigInt(balanceRaw ?? "0");
      // Prefer to keep first non-null metadata
      current.username = current.username ?? profileData.username;
      current.displayName = current.displayName ?? profileData.displayName;
      current.fid = profileData.fid;
      current.pfpUrl = current.pfpUrl ?? profileData.pfpUrl;
      current.followers = current.followers ?? profileData.followers;
      current.ensName = current.ensName ?? ensInfo?.ensName ?? null;
      current.ensAvatarUrl = current.ensAvatarUrl ?? ensInfo?.ensAvatarUrl ?? null;
      current.primaryAddress = current.primaryAddress ?? fallbackAddressForAgg ?? null;
      current.etherscanUrl =
        current.etherscanUrl ??
        etherscanUrl ??
        (fallbackAddressForAgg ? `https://etherscan.io/address/${fallbackAddressForAgg}` : null);
      current.xHandle = current.xHandle ?? combinedXHandle ?? null;
      current.xUrl = current.xUrl ?? combinedXUrl ?? null;
      current.githubHandle = current.githubHandle ?? combinedGithubHandle ?? null;
      current.githubUrl = current.githubUrl ?? combinedGithubUrl ?? null;
      byFid.set(profileData.fid, current);
    } else {
      const fallbackAddress = normalizedPrimaryAddress ?? key;
      members.push({
        address: key,
        balanceRaw,
        balanceFormatted,
        lastTransferAt: null,
        username: profileData.username,
        displayName: profileData.displayName,
        fid: profileData.fid,
        followers: profileData.followers,
        pfpUrl: profileData.pfpUrl,
        ensName: ensInfo?.ensName ?? null,
        ensAvatarUrl: ensInfo?.ensAvatarUrl ?? null,
        primaryAddress: fallbackAddress ?? null,
        etherscanUrl:
          etherscanUrl ??
          (fallbackAddress ? `https://etherscan.io/address/${fallbackAddress}` : null),
        xHandle: combinedXHandle ?? null,
        xUrl: combinedXUrl ?? null,
        githubHandle: combinedGithubHandle ?? null,
        githubUrl: combinedGithubUrl ?? null,
      });
    }
  }

  // Convert fid aggregates to members
  for (const [fid, agg] of byFid.entries()) {
    const sumRaw = agg.sum.toString();
    let sumFormatted = sumRaw;
    if (tokenDecimals !== null) {
      try {
        sumFormatted = formatUnits(BigInt(sumRaw), tokenDecimals);
      } catch (e) {
        // keep raw string if formatting fails
      }
    }
    members.push({
      address: `fc_fid_${fid}`,
      balanceRaw: sumRaw,
      balanceFormatted: sumFormatted,
      lastTransferAt: null,
      username: agg.username ?? null,
      displayName: agg.displayName ?? null,
      fid: fid,
      followers: agg.followers ?? null,
      pfpUrl: agg.pfpUrl ?? null,
      ensName: agg.ensName ?? null,
      ensAvatarUrl: agg.ensAvatarUrl ?? null,
      primaryAddress: agg.primaryAddress ?? null,
      etherscanUrl:
        agg.etherscanUrl ??
        (agg.primaryAddress
          ? `https://etherscan.io/address/${agg.primaryAddress}`
          : null),
      xHandle: agg.xHandle ?? null,
      xUrl: agg.xUrl ?? null,
      githubHandle: agg.githubHandle ?? null,
      githubUrl: agg.githubUrl ?? null,
    });
  }

  return members;
}

