import { chunk } from "lodash";
import type { Address } from "viem";
import type { DirectoryDependencies, EnsMetadata, TokenHolder } from "./types";
import { normalizeAddress, isAddress, extractOwnerAddress, parseSocialRecord } from "./utils";

const ENSTATE_BATCH_SIZE = 50;

/**
 * Fetches ENS metadata for a list of addresses
 * Uses Enstate.rs for bulk lookups, then wagmi for individual resolution
 */
export async function enrichWithEns(
  holders: TokenHolder[],
  deps: DirectoryDependencies,
): Promise<Record<string, EnsMetadata>> {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    return {};
  }

  const addresses = holders
    .map((holder) => {
      const address = extractOwnerAddress(holder);
      return address ? normalizeAddress(address) : null;
    })
    .filter((value): value is string => Boolean(value));
  const uniqueAddresses = Array.from(new Set(addresses)).filter(isAddress);

  if (uniqueAddresses.length === 0) {
    return {};
  }

  const enstateMetadata: Record<string, Partial<EnsMetadata>> = {};

  // First, try bulk lookup via Enstate.rs
  try {
    for (const batch of chunk(uniqueAddresses, ENSTATE_BATCH_SIZE)) {
      if (batch.length === 0) continue;
      const url = new URL("https://enstate.rs/bulk/a");
      for (const addr of batch) {
        url.searchParams.append("addresses[]", addr);
      }
      const response = await deps.fetchFn(url.toString());
      if (!response.ok) {
        continue;
      }
      const json = await response.json();
      const records: any[] = Array.isArray(json?.response) ? json.response : [];
      for (const record of records) {
        const addr = normalizeAddress(record?.address || "");
        if (!addr) continue;
        const partial = enstateMetadata[addr] ?? {};
        if (!partial.ensName && typeof record?.name === "string") {
          partial.ensName = record.name;
        }
        if (!partial.ensAvatarUrl && typeof record?.avatar === "string") {
          partial.ensAvatarUrl = record.avatar;
        }
        if (!partial.primaryAddress && typeof record?.chains?.eth === "string") {
          partial.primaryAddress = normalizeAddress(record.chains.eth);
        }
        const ensRecords = record?.records;
        if (ensRecords && typeof ensRecords === "object") {
          if (!partial.twitterHandle) {
            const parsedTwitter = parseSocialRecord(
              ensRecords["com.twitter"] ??
                ensRecords["twitter"] ??
                ensRecords["com.x"] ??
                ensRecords["x"],
              "twitter",
            );
            if (parsedTwitter) {
              partial.twitterHandle = parsedTwitter.handle;
              partial.twitterUrl = parsedTwitter.url;
            }
          }
          if (!partial.githubHandle) {
            const parsedGithub = parseSocialRecord(
              ensRecords["com.github"] ?? ensRecords["github"],
              "github",
            );
            if (parsedGithub) {
              partial.githubHandle = parsedGithub.handle;
              partial.githubUrl = parsedGithub.url;
            }
          }
        }
        enstateMetadata[addr] = partial;
      }
    }
  } catch (error) {
    console.error("Failed to fetch ENS social metadata", error);
  }

  // Then, resolve individual addresses via wagmi (fallback/supplement)
  const entries = await Promise.all(
    uniqueAddresses.map(async (address) => {
      const viemAddress = address as Address;
      const existing = enstateMetadata[address] ?? {};
      let ensName: string | null = existing.ensName ?? null;
      let ensAvatarUrl: string | null = existing.ensAvatarUrl ?? null;
      const twitterHandle: string | null = existing.twitterHandle ?? null;
      const twitterUrl: string | null = existing.twitterUrl ?? null;
      const githubHandle: string | null = existing.githubHandle ?? null;
      const githubUrl: string | null = existing.githubUrl ?? null;
      const primaryAddress: string | null = existing.primaryAddress
        ? normalizeAddress(existing.primaryAddress)
        : null;

      try {
        const resolvedName = await deps.getEnsNameFn(viemAddress);
        if (resolvedName) {
          ensName = ensName ?? resolvedName;
        }
        if (!ensAvatarUrl && ensName) {
          try {
            ensAvatarUrl = await deps.getEnsAvatarFn(ensName);
          } catch (avatarError) {
            console.error(
              `Failed to resolve ENS avatar for ${ensName}`,
              avatarError,
            );
          }
        }
      } catch (error) {
        console.error(
          `Failed to resolve ENS metadata for address ${address}`,
          error,
        );
      }

      return [
        address,
        {
          ensName: ensName ?? null,
          ensAvatarUrl: ensAvatarUrl ?? null,
          twitterHandle: twitterHandle ?? null,
          twitterUrl:
            twitterUrl ??
            (twitterHandle ? `https://twitter.com/${twitterHandle}` : null),
          githubHandle: githubHandle ?? null,
          githubUrl:
            githubUrl ??
            (githubHandle ? `https://github.com/${githubHandle}` : null),
          primaryAddress,
        },
      ] as const;
    }),
  );

  return Object.fromEntries(entries);
}

