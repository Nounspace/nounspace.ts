# API Endpoints Cleanup & Structure Opportunities

This document identifies opportunities for improving code structure, consistency, and maintainability across API endpoints.

## Table of Contents

1. [Directory Endpoint Issues](#directory-endpoint-issues)
2. [General API Pattern Inconsistencies](#general-api-pattern-inconsistencies)
3. [Proposed Solutions](#proposed-solutions)
4. [Specific Refactoring Recommendations](#specific-refactoring-recommendations)

---

## Directory Endpoint Issues

### 1. **File Size & Complexity**
- **Current**: 1,036 lines in a single file
- **Problem**: Too large, hard to navigate, mixes concerns
- **Impact**: Difficult to test, maintain, and understand

### 2. **Mixed Concerns**
The Directory endpoint combines:
- API request handling (lines 996-1034)
- Data fetching from external APIs (Moralis, Neynar, ENS)
- Data transformation and aggregation
- Type definitions
- Utility functions

**Better approach**: Separate into layers:
```
api/token/directory.ts          # Request handler only
lib/directory/fetchMoralis.ts   # Moralis data fetching
lib/directory/fetchNeynar.ts    # Neynar profile enrichment
lib/directory/fetchEns.ts       # ENS metadata enrichment
lib/directory/transform.ts      # Data transformation
lib/directory/types.ts          # Type definitions
```

### 3. **Complex Nested Logic**
- Lines 744-950: Deeply nested conditionals for extracting profile data
- Lines 808-872: Multiple fallback chains for `primaryAddress`
- Hard to test individual pieces
- Difficult to reason about edge cases

### 4. **Type Extraction Complexity**
```typescript
// Lines 61-69: Complex type extraction for NeynarUser
type NeynarUser = NeynarBulkUsersResponse extends Record<string, infer V>
  ? V extends Array<infer U>
    ? U
    : never
  : never;
```
**Better**: Define explicit types based on actual Neynar SDK types

### 5. **Inconsistent Validation**
- Uses inline Zod validation instead of shared `_validateQueryParams` helper
- Different error message format than other endpoints

### 6. **Testing Challenges**
- Hard to unit test due to tight coupling
- Dependencies (fetch, neynar, ENS) are not easily mockable
- Business logic mixed with API concerns

---

## General API Pattern Inconsistencies

### 1. **Validation Pattern Inconsistency**

**Pattern A** (used in `notifications/index.ts`, `search/tokens.ts`):
```typescript
const _validateQueryParams = <T extends ZodSchema>(
  req: NextApiRequest,
  schema: T,
): [z.infer<T>, null | string] => {
  const parseResult = schema.safeParse(req.query);
  if (parseResult.success) {
    return [parseResult.data, null];
  }
  const error = parseResult.error.errors[0];
  const errorMessage = `${error.message} (${error.path.join(".")})`;
  return [parseResult.data, errorMessage];
};
```

**Pattern B** (used in `token/directory.ts`):
```typescript
const parseResult = DIRECTORY_QUERY_SCHEMA.safeParse(req.query);
if (!parseResult.success) {
  return res.status(400).json({
    result: "error",
    error: {
      message: parseResult.error.errors[0]?.message ?? "Invalid request parameters",
    },
  });
}
```

**Pattern C** (used in `farcaster/neynar/channel/members.ts`):
```typescript
const channelId = getSingleQueryValue(req.query.id);
if (!channelId) {
  return res.status(400).json({
    result: "error",
    error: { message: "Missing required channel id" },
  });
}
```

**Issue**: Three different approaches to validation across endpoints

### 2. **Error Handling Inconsistency**

**Pattern A** (used in `notifications/index.ts`):
```typescript
catch (e) {
  const _isAxiosError = isAxiosError(e);
  const status = (_isAxiosError && e.response!.data.status) || 500;
  const message =
    (_isAxiosError && e.response!.data.message) ||
    "An unknown error occurred";
  return res.status(status).json({
    result: "error",
    error: { message },
  });
}
```

**Pattern B** (used in `token/directory.ts`):
```typescript
catch (error) {
  console.error("Failed to build token directory", error);
  return res.status(500).json({
    result: "error",
    error: {
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while generating the directory",
    },
  });
}
```

**Pattern C** (used in `farcaster/neynar/publishMessage.ts`):
```typescript
catch (e: any) {
  if (e.response?.data) {
    console.error("response.data")
    console.dir(e.response.data, { depth: null });
  }
  if (isAxiosError(e)) {
    res.status(e.status || 500).json(e.response?.data);
  } else {
    res.status(500).json("Unknown error occurred");
  }
}
```

**Issue**: Different error handling, logging, and response formats

### 3. **Response Format Inconsistency**

**Some endpoints** use `NounspaceResponse<T>`:
```typescript
res.status(200).json({
  result: "success",
  value: data,
});
```

**Other endpoints** return raw data:
```typescript
res.status(200).json(response); // Raw Neynar response
```

### 4. **Request Handler Usage**
- Most endpoints use `requestHandler` wrapper ✓
- Some endpoints don't handle unsupported methods consistently
- Method extraction logic is duplicated

---

## Proposed Solutions

### 1. **Create Shared Validation Utility**

**Location**: `src/common/data/api/validateRequest.ts`

```typescript
import { NextApiRequest, NextApiResponse } from "next/types";
import { z, ZodSchema } from "zod";
import { NounspaceResponse } from "./requestHandler";

export function validateQueryParams<T extends ZodSchema>(
  req: NextApiRequest,
  res: NextApiResponse<NounspaceResponse<any>>,
  schema: T,
): z.infer<T> | null {
  const parseResult = schema.safeParse(req.query);

  if (!parseResult.success) {
    const error = parseResult.error.errors[0];
    const errorMessage = error
      ? `${error.message} (${error.path.join(".")})`
      : "Invalid request parameters";
    
    res.status(400).json({
      result: "error",
      error: { message: errorMessage },
    });
    return null;
  }

  return parseResult.data;
}

export function validateBodyParams<T extends ZodSchema>(
  req: NextApiRequest,
  res: NextApiResponse<NounspaceResponse<any>>,
  schema: T,
): z.infer<T> | null {
  const parseResult = schema.safeParse(req.body);

  if (!parseResult.success) {
    const error = parseResult.error.errors[0];
    const errorMessage = error
      ? `${error.message} (${error.path.join(".")})`
      : "Invalid request body";
    
    res.status(400).json({
      result: "error",
      error: { message: errorMessage },
    });
    return null;
  }

  return parseResult.data;
}
```

### 2. **Create Shared Error Handler**

**Location**: `src/common/data/api/handleApiError.ts`

```typescript
import { NextApiResponse } from "next/types";
import { isAxiosError } from "axios";
import { NounspaceResponse } from "./requestHandler";

export function handleApiError(
  res: NextApiResponse<NounspaceResponse<any>>,
  error: unknown,
  context: string = "API request",
): void {
  console.error(`Failed ${context}:`, error);

  if (isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";

    res.status(status).json({
      result: "error",
      error: { message },
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      result: "error",
      error: { message: error.message },
    });
    return;
  }

  res.status(500).json({
    result: "error",
    error: { message: "An unexpected error occurred" },
  });
}
```

### 3. **Refactor Directory Endpoint**

**Structure**:
```
src/pages/api/token/directory.ts          # Thin request handler (~50 lines)
src/common/lib/directory/
  ├── types.ts                            # All type definitions
  ├── fetchMoralis.ts                     # Moralis API integration
  ├── fetchNeynar.ts                      # Neynar profile enrichment
  ├── fetchEns.ts                         # ENS metadata fetching
  ├── transform.ts                        # Data transformation logic
  ├── aggregate.ts                        # FID aggregation logic
  └── index.ts                            # Main fetchDirectoryData export
```

**Benefits**:
- Each module has single responsibility
- Easy to unit test individual pieces
- Reusable across different contexts
- Clear dependencies

### 4. **Standardize Response Format**

**All endpoints should use `NounspaceResponse<T>`**:

```typescript
// ✅ Good
res.status(200).json({
  result: "success",
  value: data,
});

// ❌ Bad
res.status(200).json(data);
```

### 5. **Extract Common Patterns**

**Location**: `src/common/data/api/helpers.ts`

```typescript
import { NextApiResponse } from "next/types";
import { NounspaceResponse } from "./requestHandler";

export function sendSuccess<T>(
  res: NextApiResponse<NounspaceResponse<T>>,
  data: T,
  status: number = 200,
): void {
  res.status(status).json({
    result: "success",
    value: data,
  });
}

export function sendError(
  res: NextApiResponse<NounspaceResponse<any>>,
  message: string,
  status: number = 400,
): void {
  res.status(status).json({
    result: "error",
    error: { message },
  });
}
```

---

## Specific Refactoring Recommendations

### Priority 1: High Impact, Low Risk

1. **Create shared validation utility**
   - Extract `_validateQueryParams` to shared location
   - Update all endpoints to use it
   - **Files affected**: ~15 endpoints

2. **Create shared error handler**
   - Extract error handling logic
   - Standardize error responses
   - **Files affected**: ~30 endpoints

3. **Standardize response format**
   - Ensure all endpoints use `NounspaceResponse`
   - **Files affected**: ~5 endpoints (proxies can stay as-is)

### Priority 2: Medium Impact, Medium Risk

4. **Refactor Directory endpoint**
   - Split into multiple files
   - Extract data fetching logic
   - **Files affected**: 1 endpoint (but large file)

5. **Extract common helpers**
   - `sendSuccess`, `sendError` helpers
   - **Files affected**: All endpoints (optional migration)

### Priority 3: Low Priority, High Value

6. **Create API endpoint template/generator**
   - Standard structure for new endpoints
   - Ensures consistency from the start

7. **Add API documentation**
   - Document patterns and best practices
   - Create examples for common scenarios

---

## Example: Refactored Directory Endpoint

### Before (1,036 lines in one file)

### After Structure:

**`src/pages/api/token/directory.ts`** (~50 lines):
```typescript
import { NextApiRequest, NextApiResponse } from "next/types";
import requestHandler, { NounspaceResponse } from "@/common/data/api/requestHandler";
import { validateQueryParams } from "@/common/data/api/validateRequest";
import { handleApiError } from "@/common/data/api/handleApiError";
import { fetchDirectoryData } from "@/common/lib/directory";
import { DIRECTORY_QUERY_SCHEMA } from "@/common/lib/directory/types";

const get = async (
  req: NextApiRequest,
  res: NextApiResponse<NounspaceResponse<DirectoryApiResponse>>,
) => {
  const params = validateQueryParams(req, res, DIRECTORY_QUERY_SCHEMA);
  if (!params) return; // Error already sent

  try {
    const data = await fetchDirectoryData(params);
    res.status(200).json({
      result: "success",
      value: data,
    });
  } catch (error) {
    handleApiError(res, error, "build token directory");
  }
};

export default requestHandler({ get });
```

**`src/common/lib/directory/index.ts`** (~100 lines):
```typescript
// Main orchestration function
export async function fetchDirectoryData(
  params: DirectoryQuery,
  deps: DirectoryDependencies = defaultDependencies,
): Promise<DirectoryApiResponse> {
  // 1. Fetch holders from Moralis
  const { holders, tokenDecimals, tokenSymbol } = 
    params.assetType === "nft"
      ? await fetchMoralisNftOwners(params, deps)
      : await fetchMoralisTokenHolders(params, deps);

  // 2. Enrich with Neynar profiles
  const neynarProfiles = await enrichWithNeynar(holders, deps);

  // 3. Enrich with ENS metadata
  const ensMetadata = await enrichWithEns(holders, deps);

  // 4. Transform and aggregate
  const members = transformAndAggregate(
    holders,
    neynarProfiles,
    ensMetadata,
    tokenDecimals,
  );

  return {
    fetchedAt: new Date().toISOString(),
    members,
    tokenSymbol,
    tokenDecimals,
  };
}
```

**`src/common/lib/directory/fetchMoralis.ts`** (~200 lines):
```typescript
// Isolated Moralis fetching logic
export async function fetchMoralisTokenHolders(...) { ... }
export async function fetchMoralisNftOwners(...) { ... }
```

**`src/common/lib/directory/enrichNeynar.ts`** (~100 lines):
```typescript
// Isolated Neynar enrichment logic
export async function enrichWithNeynar(...) { ... }
```

**`src/common/lib/directory/enrichEns.ts`** (~150 lines):
```typescript
// Isolated ENS enrichment logic
export async function enrichWithEns(...) { ... }
```

**`src/common/lib/directory/transform.ts`** (~200 lines):
```typescript
// Data transformation and aggregation
export function transformAndAggregate(...) { ... }
export function extractProfileData(...) { ... }
export function aggregateByFid(...) { ... }
```

**`src/common/lib/directory/types.ts`** (~100 lines):
```typescript
// All type definitions
export type DirectoryQuery = ...;
export type DirectoryMember = ...;
export type DirectoryApiResponse = ...;
// etc.
```

---

## Migration Plan

### Phase 1: Create Shared Utilities (Week 1)
1. Create `validateRequest.ts`
2. Create `handleApiError.ts`
3. Create `helpers.ts`
4. Write tests for utilities

### Phase 2: Migrate Simple Endpoints (Week 2)
1. Update 5-10 simple endpoints to use new utilities
2. Verify functionality
3. Update remaining endpoints incrementally

### Phase 3: Refactor Directory Endpoint (Week 3-4)
1. Extract types to `types.ts`
2. Extract Moralis fetching
3. Extract Neynar enrichment
4. Extract ENS enrichment
5. Extract transformation logic
6. Refactor main endpoint handler
7. Write tests for each module

### Phase 4: Documentation & Standards (Week 5)
1. Document API patterns
2. Create endpoint template
3. Update contributing guidelines

---

## Testing Improvements

With refactored structure:
- **Unit tests** for each module (Moralis, Neynar, ENS, transform)
- **Integration tests** for full flow
- **Mock dependencies** easily
- **Test edge cases** in isolation

Example:
```typescript
// test/directory/fetchMoralis.test.ts
describe('fetchMoralisTokenHolders', () => {
  it('handles pagination correctly', async () => {
    const mockFetch = jest.fn(...);
    const deps = { fetchFn: mockFetch, ... };
    // test pagination logic
  });
});
```

---

## Benefits Summary

1. **Maintainability**: Smaller, focused files are easier to understand
2. **Testability**: Isolated functions are easier to test
3. **Reusability**: Extracted logic can be reused
4. **Consistency**: Standard patterns across all endpoints
5. **Error Handling**: Consistent error responses
6. **Developer Experience**: Clear structure, easy to navigate
7. **Performance**: Easier to optimize individual pieces


