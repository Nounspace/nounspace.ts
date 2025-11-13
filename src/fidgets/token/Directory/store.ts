import { create } from "zustand";

import type {
  CsvSortOption,
  CsvTypeOption,
  DirectoryAssetType,
  DirectoryChannelFilterOption,
  DirectoryFidgetData,
  DirectoryFidgetSettings,
  DirectoryNetwork,
  DirectorySource,
} from "./types";
import { normalizeAddress as normalizeAddressUtil } from "@/common/data/api/token/utils";

type DirectoryStoreState = {
  entries: Record<string, DirectoryFidgetData>;
  setEntry: (key: string, data: DirectoryFidgetData) => void;
  hydrateEntry: (key: string, data: DirectoryFidgetData) => void;
};

export const useDirectoryStore = create<DirectoryStoreState>((set) => ({
  entries: {},
  setEntry: (key, data) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [key]: data,
      },
    })),
  hydrateEntry: (key, data) =>
    set((state) => {
      if (state.entries[key]) {
        return state;
      }
      return {
        entries: {
          ...state.entries,
          [key]: data,
        },
      };
    }),
}));

type KeyBuilderArgs = {
  source: DirectorySource;
  network?: DirectoryNetwork;
  contractAddress?: string;
  assetType?: DirectoryAssetType;
  channelName?: string;
  channelFilter?: DirectoryChannelFilterOption;
  csvUpload?: string;
  csvUploadedAt?: string;
  csvType?: CsvTypeOption;
  csvSortBy?: CsvSortOption;
  refreshToken?: string;
};

export function buildDirectoryStoreKey({
  source,
  network,
  contractAddress,
  assetType,
  channelName,
  channelFilter,
  csvUpload,
  csvUploadedAt,
  csvType,
  csvSortBy,
  refreshToken,
}: KeyBuilderArgs): string {
  if (source === "tokenHolders") {
    const normalizedAddress = normalizeAddress(contractAddress);
    const normalizedNetwork = (network ?? "mainnet").toLowerCase();
    const normalizedAsset = (assetType ?? "token").toLowerCase();
    return `token:${normalizedNetwork}:${normalizedAsset}:${normalizedAddress}`;
  }

  if (source === "farcasterChannel") {
    const chan = (channelName ?? "").trim().toLowerCase();
    const filter = (channelFilter ?? "members").toLowerCase();
    return `channel:${chan}:${filter}`;
  }

  const identifier =
    csvUpload?.trim() ||
    csvUploadedAt?.trim() ||
    refreshToken?.trim() ||
    "csv";
  const type = (csvType ?? "address").toLowerCase();
  const sort = (csvSortBy ?? "csvOrder").toLowerCase();
  return `csv:${identifier}:${type}:${sort}`;
}

function normalizeAddress(value?: string | null): string {
  if (!value) return "";
  try {
    return normalizeAddressUtil(value);
  } catch {
    return value.toLowerCase();
  }
}

export function buildInitialDirectoryData(
  payload?: DirectoryFidgetData,
): DirectoryFidgetData {
  return {
    members: payload?.members ?? [],
    lastUpdatedTimestamp: payload?.lastUpdatedTimestamp ?? null,
    tokenSymbol: payload?.tokenSymbol ?? null,
    tokenDecimals: payload?.tokenDecimals ?? null,
    lastFetchSettings: payload?.lastFetchSettings,
  };
}
