# Existing Utilities Analysis

This document identifies which utilities from the Directory refactoring plan already exist in the codebase and which need to be created.

---

## ✅ Already Existing Utilities

### 1. **Social Record Parsing** ✅
- **Location**: `src/common/data/api/token/utils.ts` (lines 64-102)
- **Function**: `parseSocialRecord(value, platform)`
- **Status**: ✅ Already exists and is exported
- **Action**: Use existing function, remove duplicate `parseSocialRecordValue` from Directory.tsx

### 2. **Address Normalization** ✅
- **Location**: `src/common/data/api/token/utils.ts` (lines 7-9)
- **Function**: `normalizeAddress(address)`
- **Status**: ✅ Already exists and is exported
- **Action**: Use existing function, remove duplicate from Directory.tsx

### 3. **Farcaster CDN URL Conversion** ✅
- **Location**: `src/common/lib/utils/farcasterCdn.ts`
- **Function**: `toFarcasterCdnUrl(url)`
- **Status**: ✅ Already exists and is used in Directory.tsx
- **Action**: Continue using existing function

### 4. **Block Explorer URLs** ✅ (Partial)
- **Location**: `src/common/components/molecules/AlchemyChainSelector.tsx` (lines 12-26)
- **Data**: `CHAIN_OPTIONS` array contains `scanUrl` for each chain
- **Status**: ✅ Data exists but not as a utility function
- **Action**: Extract to utility function or use existing data structure
- **Note**: Directory uses `"base" | "polygon" | "mainnet"` but CHAIN_OPTIONS uses `AlchemyNetwork` type. Need to map or create adapter.

### 5. **Ethereum Address Formatting** ✅
- **Location**: `src/common/lib/utils/ethereum.ts`
- **Function**: `formatEthereumAddress(address)`
- **Status**: ✅ Exists (used in ScanAddress.tsx)
- **Action**: Can be used for address display formatting

### 6. **Number Formatting** ✅ (Different purpose)
- **Location**: `src/common/lib/utils/formatNumber.ts`
- **Function**: `formatNumber(value)` - formats large numbers (1B, 1M, 1K)
- **Status**: ✅ Exists but different purpose than token balance formatting
- **Action**: Directory's `formatTokenBalance` is more specific (handles decimals, locale), keep separate

---

## ❌ Missing Utilities (Need to Create)

### 1. **Neynar Primary Address Extraction** ❌
- **Current**: Duplicated in `Directory.tsx` (lines 605-646) and `transform.ts` (lines 104-164 as `extractPrimaryAddress`)
- **Action**: Consolidate into `src/common/data/api/token/utils.ts`
- **Priority**: 🔴 High

### 2. **Neynar Social Accounts Extraction** ❌
- **Current**: Only in `Directory.tsx` (lines 648-681)
- **Similar**: `transform.ts` has `extractNeynarProfileData` (lines 34-99) which includes social accounts
- **Action**: Consolidate into `src/common/data/api/token/utils.ts`
- **Priority**: 🔴 High

### 3. **Etherscan URL Builder** ❌
- **Current**: Only in `Directory.tsx` (line 683)
- **Similar**: `ScanAddress.tsx` builds URLs but inline (line 20)
- **Action**: Create utility function in `src/common/data/api/token/utils.ts` or `src/common/lib/utils/links.ts`
- **Priority**: 🟡 Medium

### 4. **Block Explorer Link Builder** ❌
- **Current**: Only in `Directory.tsx` (lines 688-692, 929-930)
- **Similar**: `ScanAddress.tsx` builds URLs inline
- **Action**: Create utility function, can use `CHAIN_OPTIONS` from `AlchemyChainSelector.tsx` as reference
- **Priority**: 🟡 Medium

### 5. **Token Balance Formatting** ❌
- **Current**: Only in `Directory.tsx` (lines 706-716)
- **Action**: Create in `src/common/lib/utils/directoryUtils.ts` (new file)
- **Priority**: 🟡 Medium

### 6. **Font Family Resolution** ❌
- **Current**: Only in `Directory.tsx` (lines 694-704)
- **Action**: Create in `src/common/lib/utils/directoryUtils.ts` (new file)
- **Priority**: 🟡 Medium

### 7. **Last Activity Label** ❌
- **Current**: Only in `Directory.tsx` (lines 955-966)
- **Uses**: `formatDistanceToNow` from `date-fns`
- **Action**: Create in `src/common/lib/utils/directoryUtils.ts` (new file)
- **Priority**: 🟡 Medium

### 8. **Member Label Helpers** ❌
- **Current**: Only in `Directory.tsx`:
  - `getMemberPrimaryLabel` (line 932)
  - `getMemberSecondaryLabel` (lines 935-945)
  - `getMemberAvatarSrc` (lines 947-950)
  - `getMemberAvatarFallback` (lines 952-953)
- **Action**: Create in `src/common/lib/utils/directoryUtils.ts` (new file)
- **Priority**: 🟡 Medium

### 9. **Profile URL Builders** ❌
- **Current**: Only in `Directory.tsx`:
  - `getFarcasterProfileUrl` (lines 724-733)
  - `getEnsProfileUrl` (lines 735-736)
- **Similar**: Profile links use `/s/[handle]` pattern (see `ProfileSpace.tsx`)
- **Action**: Create in `src/common/lib/utils/directoryUtils.ts` (new file)
- **Priority**: 🟡 Medium

---

## 🔄 Components to Extract

### 1. **BadgeIcons Component** ❌
- **Current**: Only in `Directory.tsx` (lines 738-927)
- **Similar**: `src/common/components/atoms/badge.tsx` exists but is a generic badge component (different purpose)
- **Action**: Extract to `src/fidgets/token/components/BadgeIcons.tsx`
- **Priority**: 🔴 High

### 2. **ProfileLink Component** ❌
- **Current**: Only in `Directory.tsx` (lines 2285-2317)
- **Similar**: Profile links exist throughout codebase (e.g., `/s/[handle]` pattern)
- **Action**: Extract to `src/fidgets/token/components/ProfileLink.tsx`
- **Priority**: 🟡 Medium

### 3. **PaginationControls Component** ❌
- **Current**: Only in `Directory.tsx` (lines 2319-2366)
- **Similar**: No existing pagination component found
- **Action**: Extract to `src/fidgets/token/components/PaginationControls.tsx`
- **Priority**: 🟡 Medium

---

## 📋 Updated Refactoring Plan

### Phase 1: Consolidate Existing Utilities

1. **Remove duplicates from Directory.tsx**:
   - Remove `parseSocialRecordValue` → use `parseSocialRecord` from `utils.ts`
   - Remove `normalizeAddress` → use existing from `utils.ts`

2. **Add missing utilities to `src/common/data/api/token/utils.ts`**:
   - `extractNeynarPrimaryAddress` (consolidate from Directory.tsx and transform.ts)
   - `extractNeynarSocialAccounts` (consolidate from Directory.tsx)
   - `buildEtherscanUrl` (from Directory.tsx)
   - `getBlockExplorerLink` (from Directory.tsx, can use CHAIN_OPTIONS pattern)

3. **Create `src/common/lib/utils/directoryUtils.ts`**:
   - `formatTokenBalance`
   - `resolveFontFamily`
   - `getLastActivityLabel`
   - `getMemberPrimaryLabel`
   - `getMemberSecondaryLabel`
   - `getMemberAvatarSrc`
   - `getMemberAvatarFallback`
   - `getFarcasterProfileUrl`
   - `getEnsProfileUrl`

### Phase 2: Extract Components

1. Extract `BadgeIcons` component
2. Extract `ProfileLink` component
3. Extract `PaginationControls` component
4. Extract view components (`DirectoryCardView`, `DirectoryListView`)

### Phase 3: Extract Hooks and Data Sources

1. Extract data fetching hooks
2. Extract state management hooks
3. Extract data source modules

---

## 🔍 Key Findings

### Duplication Status:
- ✅ **2 functions** already exist and can be reused (`parseSocialRecord`, `normalizeAddress`)
- ❌ **15+ functions** need to be created/consolidated
- ❌ **3 components** need to be extracted

### Existing Patterns to Leverage:
1. **Block Explorer URLs**: `CHAIN_OPTIONS` in `AlchemyChainSelector.tsx` has scan URLs - can be used as reference
2. **Profile Links**: `/s/[handle]` pattern used throughout (see `ProfileSpace.tsx`)
3. **Farcaster URLs**: `warpcast.com` URLs used in multiple places
4. **Address Formatting**: `formatEthereumAddress` exists in `ethereum.ts`

### Type Compatibility Notes:
- Directory uses `DirectoryNetwork = "base" | "polygon" | "mainnet"`
- `AlchemyChainSelector` uses `AlchemyNetwork` which includes more chains
- May need adapter function or type mapping

---

## 📊 Summary Statistics

| Category | Existing | Missing | Total |
|----------|----------|---------|-------|
| Utility Functions | 2 | 15+ | 17+ |
| Components | 0 | 3 | 3 |
| Hooks | 0 | 4 | 4 |
| Data Sources | 0 | 3 | 3 |

---

## 🎯 Recommended Action Plan

1. **Immediate**: Remove duplicate `parseSocialRecordValue` and `normalizeAddress` from Directory.tsx
2. **High Priority**: Consolidate Neynar extraction functions into `utils.ts`
3. **Medium Priority**: Create `directoryUtils.ts` for component-specific utilities
4. **Medium Priority**: Extract BadgeIcons component (largest component to extract)
5. **Lower Priority**: Extract other components and hooks

