# Directory Component Refactoring Plan

## Overview
This document provides specific recommendations for splitting `Directory.tsx` (2,373 lines) into smaller, maintainable modules and consolidating duplicate functions into shared utilities.

---

## 1. Shared Utilities Consolidation

### 1.1 Functions to Move to `src/common/data/api/token/utils.ts`

These functions are **duplicated** between `Directory.tsx` and the API/transform modules:

#### Already in utils.ts (keep there):
- ✅ `normalizeAddress` - Already exported
- ✅ `parseSocialRecord` - Already exported (matches `parseSocialRecordValue`)

#### Functions to ADD to utils.ts:

```typescript
// From Directory.tsx lines 605-646
export function extractNeynarPrimaryAddress(user: any): string | null {
  // Move implementation from Directory.tsx
  // This is duplicated in transform.ts as extractPrimaryAddress
}

// From Directory.tsx lines 648-681  
export function extractNeynarSocialAccounts(user: any): {
  xHandle: string | null;
  xUrl: string | null;
  githubHandle: string | null;
  githubUrl: string | null;
} {
  // Move implementation from Directory.tsx
  // Similar logic exists in transform.ts extractNeynarProfileData
}

// From Directory.tsx line 683
export function buildEtherscanUrl(address?: string | null): string | null {
  return address ? `https://etherscan.io/address/${address.toLowerCase()}` : null;
}

// From Directory.tsx line 688
export const BLOCK_EXPLORER_URLS: Record<"base" | "polygon" | "mainnet", string> = {
  mainnet: "https://etherscan.io/address/",
  base: "https://basescan.org/address/",
  polygon: "https://polygonscan.com/address/",
};

export function getBlockExplorerLink(
  network: "base" | "polygon" | "mainnet",
  address: string
): string {
  return `${BLOCK_EXPLORER_URLS[network]}${address}`;
}
```

#### Functions to ADD to `src/common/lib/utils/directoryUtils.ts` (new file):

```typescript
// Component-specific utilities (not API-related)

// From Directory.tsx line 706
export function formatTokenBalance(value: string | null | undefined): string {
  if (value == null || value === "") return "0";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return parsed.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// From Directory.tsx line 694
export function resolveFontFamily(
  value: string | undefined,
  fallback: string,
  fontOptions: typeof FONT_FAMILY_OPTIONS
): string {
  // Move implementation
}

// From Directory.tsx line 955
export function getLastActivityLabel(timestamp?: string | null): string | null {
  // Move implementation using formatDistanceToNow
}

// From Directory.tsx line 932
export function getMemberPrimaryLabel(member: DirectoryMemberData): string {
  return member.displayName || member.username || member.ensName || member.address;
}

// From Directory.tsx line 935
export function getMemberSecondaryLabel(member: DirectoryMemberData): string | null {
  // Move implementation
}

// From Directory.tsx line 947
export function getMemberAvatarSrc(member: DirectoryMemberData): string | undefined {
  // Move implementation
}

// From Directory.tsx line 952
export function getMemberAvatarFallback(member: DirectoryMemberData): string | undefined {
  // Move implementation
}

// From Directory.tsx line 724
export function getFarcasterProfileUrl(
  username?: string | null,
  fid?: number | null
): string | null {
  // Move implementation
}

// From Directory.tsx line 735
export function getEnsProfileUrl(ensName?: string | null): string | null {
  return ensName ? `https://app.ens.domains/${ensName}` : null;
}
```

---

## 2. Component Extraction Plan

### 2.1 New File Structure

```
src/fidgets/token/
├── Directory.tsx                    # Main component (~200 lines)
├── Directory.module.ts              # Fidget module export
├── components/
│   ├── DirectoryCardView.tsx        # Card layout (~150 lines)
│   ├── DirectoryListView.tsx       # List layout (~150 lines)
│   ├── BadgeIcons.tsx              # Badge component (~200 lines)
│   ├── ProfileLink.tsx              # Profile link wrapper (~30 lines)
│   └── PaginationControls.tsx      # Pagination component (~50 lines)
├── hooks/
│   ├── useDirectoryData.ts          # Data fetching hook (~300 lines)
│   ├── useDirectoryState.ts        # Local state management (~100 lines)
│   ├── useDirectoryPagination.ts   # Pagination logic (~50 lines)
│   └── useDirectoryFilters.ts      # Filtering/sorting logic (~100 lines)
├── dataSources/
│   ├── tokenHoldersSource.ts       # Token holders fetching (~100 lines)
│   ├── farcasterChannelSource.ts   # Channel fetching (~150 lines)
│   └── csvSource.ts                # CSV parsing & fetching (~200 lines)
├── constants.ts                     # Constants and options (~100 lines)
└── types.ts                         # Type definitions (~100 lines)
```

---

## 3. Detailed Module Breakdown

### 3.1 `src/fidgets/token/types.ts` (NEW)

**Extract from Directory.tsx lines 42-106:**

```typescript
export type DirectoryNetwork = "base" | "polygon" | "mainnet";
export type DirectoryAssetType = "token" | "nft";
export type DirectorySortOption = "tokenHoldings" | "followers";
export type DirectoryLayoutStyle = "cards" | "list";
export type DirectoryIncludeOption = "holdersWithFarcasterAccount" | "allHolders";
export type DirectorySource = "tokenHolders" | "farcasterChannel" | "csv";
export type DirectoryChannelFilterOption = "members" | "followers" | "all";
export type CsvTypeOption = "address" | "fid" | "username";
export type CsvSortOption = "followers" | "csvOrder";

export interface DirectoryMemberData {
  // ... (lines 55-73)
}

export interface DirectoryFidgetData extends FidgetData {
  // ... (lines 75-81)
}

export type DirectoryFidgetSettings = FidgetSettings & FidgetSettingsStyle & {
  // ... (lines 83-106)
};
```

---

### 3.2 `src/fidgets/token/constants.ts` (NEW)

**Extract from Directory.tsx lines 38-177:**

```typescript
export const STALE_AFTER_MS = 60 * 60 * 1000;
export const PAGE_SIZE = 100;
export const CHANNEL_FETCH_DEBOUNCE_MS = 800;

export const NETWORK_OPTIONS = [
  { name: "Base", value: "base" },
  { name: "Polygon", value: "polygon" },
  { name: "Ethereum Mainnet", value: "mainnet" },
] as const;

export const SORT_OPTIONS = [
  { name: "Token holdings", value: "tokenHoldings" },
  { name: "Followers", value: "followers" },
] as const;

export const LAYOUT_OPTIONS = [
  { name: "Cards", value: "cards" },
  { name: "List", value: "list" },
] as const;

export const ASSET_TYPE_OPTIONS = [
  { name: "Token", value: "token" },
  { name: "NFT", value: "nft" },
] as const;

export const INCLUDE_OPTIONS = [
  { name: "Holders with Farcaster Account", value: "holdersWithFarcasterAccount" },
  { name: "All holders", value: "allHolders" },
] as const;

export const SOURCE_OPTIONS = [
  { name: "Token Holders", value: "tokenHolders" },
  { name: "Farcaster Channel", value: "farcasterChannel" },
  { name: "CSV", value: "csv" },
] as const;

export const CHANNEL_FILTER_OPTIONS = [
  { name: "Members", value: "members" },
  { name: "Followers", value: "followers" },
  { name: "All", value: "all" },
] as const;

export const CSV_TYPE_OPTIONS = [
  { name: "Address", value: "address" },
  { name: "FID", value: "fid" },
  { name: "Farcaster username", value: "username" },
] as const;

export const CSV_SORT_OPTIONS = [
  { name: "Followers", value: "followers" },
  { name: "CSV order", value: "csvOrder" },
] as const;

// Badge image paths
export const FARCASTER_BADGE_SRC = "/images/farcaster.jpeg";
export const ENS_BADGE_SRC = "/images/ens.svg";
export const X_BADGE_SRC = "/images/twitter.avif";
export const GITHUB_BADGE_SRC = "/images/github.svg";
export const ETHERSCAN_BADGE_SRC = "/images/etherscan.svg";
```

---

### 3.3 `src/fidgets/token/components/BadgeIcons.tsx` (NEW)

**Extract from Directory.tsx lines 738-927:**

```typescript
import React from "react";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";
import {
  FARCASTER_BADGE_SRC,
  ENS_BADGE_SRC,
  X_BADGE_SRC,
  GITHUB_BADGE_SRC,
  ETHERSCAN_BADGE_SRC,
} from "../constants";
import { getFarcasterProfileUrl, getEnsProfileUrl } from "@/common/lib/utils/directoryUtils";
import { buildEtherscanUrl } from "@/common/data/api/token/utils";

export type BadgeIconsProps = {
  username?: string | null;
  ensName?: string | null;
  ensAvatarUrl?: string | null;
  fid?: number | null;
  primaryAddress?: string | null;
  etherscanUrl?: string | null;
  xHandle?: string | null;
  xUrl?: string | null;
  githubHandle?: string | null;
  githubUrl?: string | null;
  size?: number;
  gapClassName?: string;
};

export const BadgeIcons: React.FC<BadgeIconsProps> = ({
  // ... props
}) => {
  // Move entire implementation from Directory.tsx lines 753-927
};
```

---

### 3.4 `src/fidgets/token/components/ProfileLink.tsx` (NEW)

**Extract from Directory.tsx lines 2285-2310:**

```typescript
import React from "react";
import Link from "next/link";
import { mergeClasses } from "@/common/lib/utils/mergeClasses";

export type ProfileLinkProps = {
  username?: string | null;
  fallbackHref?: string;
  className?: string;
  children: React.ReactNode;
};

export const ProfileLink: React.FC<ProfileLinkProps> = ({
  username,
  fallbackHref,
  className,
  children,
}) => {
  // Move implementation from Directory.tsx lines 2292-2310
};
```

---

### 3.5 `src/fidgets/token/components/PaginationControls.tsx` (NEW)

**Extract from Directory.tsx lines 2312-2366:**

```typescript
import React from "react";
import { PAGE_SIZE } from "../constants";

export type PaginationControlsProps = {
  currentPage: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  totalCount: number;
};

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  // ... props
}) => {
  // Move implementation from Directory.tsx lines 2327-2366
};
```

---

### 3.6 `src/fidgets/token/components/DirectoryCardView.tsx` (NEW)

**Extract from Directory.tsx lines 2162-2267:**

```typescript
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/atoms/avatar";
import BoringAvatar from "boring-avatars";
import { DirectoryMemberData, DirectoryFidgetSettings } from "../types";
import { ProfileLink } from "./ProfileLink";
import { BadgeIcons } from "./BadgeIcons";
import {
  getMemberPrimaryLabel,
  getMemberSecondaryLabel,
  getMemberAvatarSrc,
  getMemberAvatarFallback,
  getLastActivityLabel,
  formatTokenBalance,
} from "@/common/lib/utils/directoryUtils";
import { buildEtherscanUrl } from "@/common/data/api/token/utils";
import { toFarcasterCdnUrl } from "@/common/lib/utils/farcasterCdn";

export type DirectoryCardViewProps = {
  members: DirectoryMemberData[];
  settings: DirectoryFidgetSettings;
  tokenSymbol?: string | null;
  headingTextStyle: React.CSSProperties;
  headingFontFamilyStyle: React.CSSProperties;
  network: "base" | "polygon" | "mainnet";
  includeFilter: "holdersWithFarcasterAccount" | "allHolders";
};

export const DirectoryCardView: React.FC<DirectoryCardViewProps> = ({
  members,
  settings,
  tokenSymbol,
  headingTextStyle,
  headingFontFamilyStyle,
  network,
  includeFilter,
}) => {
  // Extract card rendering logic from Directory.tsx lines 2162-2267
  // This is the grid of cards
};
```

---

### 3.7 `src/fidgets/token/components/DirectoryListView.tsx` (NEW)

**Extract from Directory.tsx lines 2072-2161:**

```typescript
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/atoms/avatar";
import BoringAvatar from "boring-avatars";
import { DirectoryMemberData, DirectoryFidgetSettings } from "../types";
import { ProfileLink } from "./ProfileLink";
import { BadgeIcons } from "./BadgeIcons";
import {
  getMemberPrimaryLabel,
  getMemberSecondaryLabel,
  getMemberAvatarSrc,
  getMemberAvatarFallback,
  getLastActivityLabel,
  formatTokenBalance,
} from "@/common/lib/utils/directoryUtils";
import { buildEtherscanUrl, getBlockExplorerLink } from "@/common/data/api/token/utils";
import { toFarcasterCdnUrl } from "@/common/lib/utils/farcasterCdn";

export type DirectoryListViewProps = {
  members: DirectoryMemberData[];
  settings: DirectoryFidgetSettings;
  tokenSymbol?: string | null;
  headingTextStyle: React.CSSProperties;
  network: "base" | "polygon" | "mainnet";
  includeFilter: "holdersWithFarcasterAccount" | "allHolders";
};

export const DirectoryListView: React.FC<DirectoryListViewProps> = ({
  members,
  settings,
  tokenSymbol,
  headingTextStyle,
  network,
  includeFilter,
}) => {
  // Extract list rendering logic from Directory.tsx lines 2072-2161
  // This is the list view
};
```

---

### 3.8 `src/fidgets/token/dataSources/csvSource.ts` (NEW)

**Extract from Directory.tsx lines 1371-1445 (parseCsv) and 1447-1787 (fetchCsvDirectory):**

```typescript
import { CsvTypeOption, DirectoryMemberData, DirectoryFidgetSettings } from "../types";
import { extractNeynarPrimaryAddress, extractNeynarSocialAccounts } from "@/common/data/api/token/utils";
import { buildEtherscanUrl } from "@/common/data/api/token/utils";

export function parseCsv(raw: string, type: CsvTypeOption): string[] {
  // Move implementation from Directory.tsx lines 1371-1445
}

export async function fetchCsvDirectory(
  settings: DirectoryFidgetSettings,
  controller: AbortController
): Promise<DirectoryMemberData[]> {
  // Move implementation from Directory.tsx lines 1447-1787
  // This handles:
  // - CSV parsing
  // - Username/FID/Address lookup
  // - Neynar API calls
  // - ENS resolution
  // - Member data transformation
}
```

---

### 3.9 `src/fidgets/token/dataSources/farcasterChannelSource.ts` (NEW)

**Extract from Directory.tsx lines 1263-1369:**

```typescript
import { DirectoryMemberData, DirectoryFidgetSettings, DirectoryChannelFilterOption } from "../types";
import { extractNeynarPrimaryAddress, extractNeynarSocialAccounts } from "@/common/data/api/token/utils";
import { buildEtherscanUrl } from "@/common/data/api/token/utils";

export async function fetchFarcasterChannelDirectory(
  settings: DirectoryFidgetSettings,
  controller: AbortController
): Promise<DirectoryMemberData[]> {
  // Move implementation from Directory.tsx lines 1263-1369
  // This handles:
  // - Channel members/followers fetching
  // - User data transformation
  // - Sorting by followers
}
```

---

### 3.10 `src/fidgets/token/dataSources/tokenHoldersSource.ts` (NEW)

**Extract from Directory.tsx lines 1219-1261:**

```typescript
import { DirectoryMemberData, DirectoryFidgetSettings } from "../types";

export async function fetchTokenHoldersDirectory(
  settings: DirectoryFidgetSettings,
  controller: AbortController
): Promise<{
  members: DirectoryMemberData[];
  tokenSymbol: string | null;
  tokenDecimals: number | null;
}> {
  // Move implementation from Directory.tsx lines 1219-1261
  // This handles:
  // - API call to /api/token/directory
  // - Response parsing
  // - Sorting
}
```

---

### 3.11 `src/fidgets/token/hooks/useDirectoryData.ts` (NEW)

**Extract from Directory.tsx lines 1073-1200, 1788-1825:**

```typescript
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { DirectoryFidgetData, DirectoryFidgetSettings } from "../types";
import { fetchTokenHoldersDirectory } from "../dataSources/tokenHoldersSource";
import { fetchFarcasterChannelDirectory } from "../dataSources/farcasterChannelSource";
import { fetchCsvDirectory } from "../dataSources/csvSource";
import { sortMembers } from "../utils/sorting";
import { STALE_AFTER_MS } from "../constants";
import { isEqual } from "lodash";

export function useDirectoryData(
  settings: DirectoryFidgetSettings,
  initialData: DirectoryFidgetData | undefined,
  saveData: (data: DirectoryFidgetData) => Promise<void>
) {
  const [directoryData, setDirectoryData] = useState<DirectoryFidgetData>(() => ({
    members: initialData?.members ?? [],
    lastUpdatedTimestamp: initialData?.lastUpdatedTimestamp ?? null,
    tokenSymbol: initialData?.tokenSymbol ?? null,
    tokenDecimals: initialData?.tokenDecimals ?? null,
    lastFetchSettings: initialData?.lastFetchSettings,
  }));

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync with prop data
  useEffect(() => {
    // Move logic from Directory.tsx lines 1087-1113
  }, [initialData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const persistDataIfChanged = useCallback(
    async (payload: DirectoryFidgetData) => {
      // Move logic from Directory.tsx lines 1201-1217
    },
    [directoryData, saveData]
  );

  const fetchDirectory = useCallback(async () => {
    // Move logic from Directory.tsx lines 1788-1825
    // Routes to appropriate data source based on settings.source
  }, [settings, persistDataIfChanged]);

  const shouldRefresh = useMemo(() => {
    // Move logic from Directory.tsx lines 1149-1199
  }, [settings, directoryData]);

  // Auto-refresh effect
  useEffect(() => {
    // Move logic from Directory.tsx lines 1189-1199
  }, [shouldRefresh, fetchDirectory]);

  return {
    directoryData,
    isRefreshing,
    error,
    fetchDirectory,
    refresh: fetchDirectory,
  };
}
```

---

### 3.12 `src/fidgets/token/hooks/useDirectoryState.ts` (NEW)

**Extract from Directory.tsx lines 1004-1021, 1030-1031, 1145-1147:**

```typescript
import { useState, useEffect } from "react";
import { DirectorySortOption, DirectoryLayoutStyle, DirectoryChannelFilterOption, DirectoryFidgetSettings } from "../types";
import { sanitizeSortOption } from "../utils/sorting";

export function useDirectoryState(settings: DirectoryFidgetSettings) {
  const [currentSort, setCurrentSort] = useState<DirectorySortOption>(
    sanitizeSortOption(settings.sortBy)
  );
  const [currentLayout, setCurrentLayout] = useState<DirectoryLayoutStyle>(
    settings.layoutStyle
  );
  const [currentChannelFilter, setCurrentChannelFilter] = useState<DirectoryChannelFilterOption>(
    (settings.channelFilter ?? "members") as DirectoryChannelFilterOption
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [debouncedChannelName, setDebouncedChannelName] = useState(
    (settings.channelName ?? "").trim()
  );

  // Sync with settings changes
  useEffect(() => {
    setCurrentSort(sanitizeSortOption(settings.sortBy));
    setCurrentLayout(settings.layoutStyle);
    setCurrentChannelFilter((settings.channelFilter ?? "members") as DirectoryChannelFilterOption);
    setCurrentPage(1);
  }, [settings.layoutStyle, settings.sortBy, settings.channelFilter]);

  // Debounce channel name
  useEffect(() => {
    // Move logic from Directory.tsx lines 1121-1128
  }, [settings.channelName, settings.source]);

  return {
    currentSort,
    setCurrentSort,
    currentLayout,
    setCurrentLayout,
    currentChannelFilter,
    setCurrentChannelFilter,
    currentPage,
    setCurrentPage,
    debouncedChannelName,
  };
}
```

---

### 3.13 `src/fidgets/token/hooks/useDirectoryFilters.ts` (NEW)

**Extract from Directory.tsx lines 1893-1943:**

```typescript
import { useMemo } from "react";
import { DirectoryMemberData, DirectorySortOption, DirectoryIncludeOption } from "../types";
import { sortMembers } from "../utils/sorting";

export function useDirectoryFilters(
  members: DirectoryMemberData[],
  sortBy: DirectorySortOption,
  includeFilter: DirectoryIncludeOption,
  source: "tokenHolders" | "farcasterChannel" | "csv"
) {
  const filteredSortedMembers = useMemo(() => {
    // Move logic from Directory.tsx lines 1893-1915
    // Filters by includeFilter
    // Sorts by sortBy
  }, [members, sortBy, includeFilter, source]);

  const emptyStateMessage = useMemo(() => {
    // Move logic from Directory.tsx lines 1932-1942
  }, [source, includeFilter]);

  return {
    filteredSortedMembers,
    emptyStateMessage,
  };
}
```

---

### 3.14 `src/fidgets/token/hooks/useDirectoryPagination.ts` (NEW)

**Extract from Directory.tsx lines 1916-1930:**

```typescript
import { useMemo } from "react";
import { PAGE_SIZE } from "../constants";

export function useDirectoryPagination(
  members: DirectoryMemberData[],
  currentPage: number
) {
  const pageCount = useMemo(() => {
    return Math.ceil(members.length / PAGE_SIZE);
  }, [members.length]);

  const displayedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return members.slice(start, end);
  }, [members, currentPage]);

  return {
    pageCount,
    displayedMembers,
  };
}
```

---

### 3.15 `src/fidgets/token/utils/sorting.ts` (NEW)

**Extract from Directory.tsx lines 968-995:**

```typescript
import { DirectorySortOption, DirectoryMemberData } from "../types";

export function sanitizeSortOption(value: unknown): DirectorySortOption {
  return value === "followers" ? "followers" : "tokenHoldings";
}

export function sortMembers(
  members: DirectoryMemberData[],
  sortBy: DirectorySortOption
): DirectoryMemberData[] {
  const entries = [...members];

  if (sortBy === "followers") {
    entries.sort((a, b) => (b.followers ?? -1) - (a.followers ?? -1));
    return entries;
  }

  entries.sort((a, b) => {
    try {
      const aValue = BigInt(a.balanceRaw ?? "0");
      const bValue = BigInt(b.balanceRaw ?? "0");
      if (bValue > aValue) return 1;
      if (bValue < aValue) return -1;
      return 0;
    } catch (error) {
      return 0;
    }
  });

  return entries;
}
```

---

### 3.16 `src/fidgets/token/Directory.tsx` (REFACTORED - Main Component)

**Final structure (~200-250 lines):**

```typescript
import React, { useMemo } from "react";
import { FidgetArgs } from "@/common/fidgets";
import { DirectoryFidgetSettings, DirectoryFidgetData } from "./types";
import { directoryProperties } from "./Directory.module";
import { useDirectoryData } from "./hooks/useDirectoryData";
import { useDirectoryState } from "./hooks/useDirectoryState";
import { useDirectoryFilters } from "./hooks/useDirectoryFilters";
import { useDirectoryPagination } from "./hooks/useDirectoryPagination";
import { DirectoryCardView } from "./components/DirectoryCardView";
import { DirectoryListView } from "./components/DirectoryListView";
import { PaginationControls } from "./components/PaginationControls";
import { resolveFontFamily } from "@/common/lib/utils/directoryUtils";
import { FONT_FAMILY_OPTIONS } from "@/common/lib/theme/fonts";

const Directory: React.FC<FidgetArgs<DirectoryFidgetSettings, DirectoryFidgetData>> = ({
  settings,
  data,
  saveData,
}) => {
  // Data fetching
  const { directoryData, isRefreshing, error, refresh } = useDirectoryData(
    settings,
    data,
    saveData
  );

  // Local state
  const {
    currentSort,
    setCurrentSort,
    currentLayout,
    setCurrentLayout,
    currentChannelFilter,
    setCurrentChannelFilter,
    currentPage,
    setCurrentPage,
    debouncedChannelName,
  } = useDirectoryState(settings);

  // Filtering and sorting
  const { filteredSortedMembers, emptyStateMessage } = useDirectoryFilters(
    directoryData.members,
    currentSort,
    settings.include ?? "holdersWithFarcasterAccount",
    settings.source ?? "tokenHolders"
  );

  // Pagination
  const { pageCount, displayedMembers } = useDirectoryPagination(
    filteredSortedMembers,
    currentPage
  );

  // Font styles
  const primaryFontFamily = useMemo(
    () => resolveFontFamily(settings.primaryFontFamily, "var(--user-theme-headings-font)", FONT_FAMILY_OPTIONS),
    [settings.primaryFontFamily]
  );
  // ... other style computations

  // Render
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      {/* View controls */}
      {/* Error display */}
      {/* Content: Card or List view */}
      {currentLayout === "list" ? (
        <DirectoryListView
          members={displayedMembers}
          settings={settings}
          tokenSymbol={directoryData.tokenSymbol}
          headingTextStyle={headingTextStyle}
          network={settings.network}
          includeFilter={settings.include ?? "holdersWithFarcasterAccount"}
        />
      ) : (
        <DirectoryCardView
          members={displayedMembers}
          settings={settings}
          tokenSymbol={directoryData.tokenSymbol}
          headingTextStyle={headingTextStyle}
          headingFontFamilyStyle={headingFontFamilyStyle}
          network={settings.network}
          includeFilter={settings.include ?? "holdersWithFarcasterAccount"}
        />
      )}
      {/* Pagination */}
    </div>
  );
};

export default Directory;
```

---

## 4. Consolidation Summary

### Functions to Consolidate:

| Function | Current Location(s) | Target Location | Priority |
|----------|-------------------|-----------------|----------|
| `parseSocialRecordValue` / `parseSocialRecord` | Directory.tsx, utils.ts | `utils.ts` (keep existing) | 🔴 High |
| `extractNeynarPrimaryAddress` | Directory.tsx, transform.ts | `utils.ts` (new) | 🔴 High |
| `extractNeynarSocialAccounts` | Directory.tsx | `utils.ts` (new) | 🔴 High |
| `normalizeAddress` | Directory.tsx, utils.ts | `utils.ts` (keep existing) | 🔴 High |
| `buildEtherscanUrl` | Directory.tsx | `utils.ts` (new) | 🟡 Medium |
| `getBlockExplorerLink` | Directory.tsx | `utils.ts` (new) | 🟡 Medium |
| `formatTokenBalance` | Directory.tsx | `directoryUtils.ts` (new) | 🟡 Medium |
| `resolveFontFamily` | Directory.tsx | `directoryUtils.ts` (new) | 🟡 Medium |
| `getLastActivityLabel` | Directory.tsx | `directoryUtils.ts` (new) | 🟡 Medium |
| `getMemberPrimaryLabel` | Directory.tsx | `directoryUtils.ts` (new) | 🟡 Medium |
| `getMemberSecondaryLabel` | Directory.tsx | `directoryUtils.ts` (new) | 🟡 Medium |
| `getMemberAvatarSrc` | Directory.tsx | `directoryUtils.ts` (new) | 🟡 Medium |
| `getMemberAvatarFallback` | Directory.tsx | `directoryUtils.ts` (new) | 🟡 Medium |
| `getFarcasterProfileUrl` | Directory.tsx | `directoryUtils.ts` (new) | 🟡 Medium |
| `getEnsProfileUrl` | Directory.tsx | `directoryUtils.ts` (new) | 🟡 Medium |
| `sortMembers` | Directory.tsx | `utils/sorting.ts` (new) | 🟡 Medium |
| `sanitizeSortOption` | Directory.tsx | `utils/sorting.ts` (new) | 🟡 Medium |

---

## 5. Migration Steps

### Phase 1: Extract Shared Utilities (Week 1)
1. ✅ Move duplicate functions to `utils.ts`
2. ✅ Create `directoryUtils.ts` for component-specific utilities
3. ✅ Update imports in both Directory.tsx and API files

### Phase 2: Extract Components (Week 2)
1. ✅ Extract `BadgeIcons`, `ProfileLink`, `PaginationControls`
2. ✅ Extract `DirectoryCardView` and `DirectoryListView`
3. ✅ Update Directory.tsx to use new components

### Phase 3: Extract Data Sources (Week 3)
1. ✅ Extract CSV parsing and fetching
2. ✅ Extract Farcaster channel fetching
3. ✅ Extract token holders fetching
4. ✅ Create unified data source interface

### Phase 4: Extract Hooks (Week 4)
1. ✅ Extract `useDirectoryData`
2. ✅ Extract `useDirectoryState`
3. ✅ Extract `useDirectoryFilters`
4. ✅ Extract `useDirectoryPagination`

### Phase 5: Refactor Main Component (Week 5)
1. ✅ Simplify Directory.tsx to orchestration only
2. ✅ Update all imports
3. ✅ Test all functionality
4. ✅ Remove old code

---

## 6. Expected Results

### Before:
- **Directory.tsx**: 2,373 lines
- **Duplicated functions**: 5+
- **React hooks**: 45+
- **Maintainability**: Low

### After:
- **Directory.tsx**: ~200-250 lines
- **Total modules**: 15+ focused files
- **Duplicated functions**: 0
- **React hooks**: Organized into custom hooks
- **Maintainability**: High
- **Testability**: High (each module can be tested independently)

---

## 7. Testing Strategy

After refactoring, each module should have:
- **Unit tests** for utility functions
- **Component tests** for UI components
- **Hook tests** for custom hooks
- **Integration tests** for data sources
- **E2E tests** for full Directory functionality

