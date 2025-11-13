# Fidget Data Field Patterns

This document outlines essential patterns for fidgets that use the `data` field in `FidgetConfig` to store runtime state and cached data. These patterns are derived from the Directory fidget implementation and should be considered best practices.

**Key Architecture Principle**: The Zustand store is the single source of truth. Fidgets receive `data` as a prop and should use it directly - no local state needed. When you call `saveData()`, the store updates immediately and the component re-renders automatically.

## Table of Contents

1. [Using Data Prop Directly (Recommended)](#using-data-prop-directly-recommended)
2. [Two-Phase Save System](#two-phase-save-system)
3. [Change Detection Before Persistence](#change-detection-before-persistence)
4. [AbortController for Async Operations](#abortcontroller-for-async-operations)
5. [Error State Management](#error-state-management)
6. [Refresh Detection with React Dependencies](#refresh-detection-with-react-dependencies-simplified)
7. [Staleness Detection](#staleness-detection)
8. [Debouncing User Input](#debouncing-user-input)
9. [Loading State Management](#loading-state-management)
10. [Settings Change Reset Pattern](#settings-change-reset-pattern)

---

## Using Data Prop Directly (Recommended)

**Pattern**: Use the `data` prop directly from the Zustand store. No local state needed - the store is the single source of truth.

```typescript
const Directory: React.FC<FidgetArgs<Settings, Data>> = ({ settings, data, saveData }) => {
  // Read directly from prop - store is source of truth
  const members = data?.members ?? [];
  const lastUpdated = data?.lastUpdatedTimestamp;
  const tokenSymbol = data?.tokenSymbol;
  
  // Use data prop in useMemo, useCallback, etc.
  const filteredMembers = useMemo(() => {
    return members.filter(/* ... */);
  }, [members, /* other deps */]);
}
```

**Why**: 
- **Single source of truth**: Zustand store is the authoritative source
- **Automatic updates**: Store updates trigger component re-renders automatically
- **Simpler code**: No sync logic, no state drift, no equality checks needed
- **Immediate updates**: When you call `saveData()`, store updates immediately and component re-renders

**Key Points**:
- Always provide defaults when reading: `data?.field ?? defaultValue`
- Use optional chaining: `data?.members` instead of `data.members`
- Store updates automatically trigger re-renders - no manual sync needed
- Only use local state for transient UI state (loading, error, form inputs)

**Data Flow**:
```
Zustand Store → data prop → Component reads directly
Component calls saveData() → Store updates → Component re-renders automatically
```

---

## When You Might Need Local State

**Only use local state for**:
- **Transient UI state**: `isRefreshing`, `error`, form inputs
- **Derived/computed state**: Values computed from props that shouldn't trigger store updates
- **Optimistic updates**: If you need to show data before API confirms (not recommended)

**Don't use local state for**:
- Data that comes from the store (use `data` prop directly)
- Data that needs to persist (use `saveData()`)
- Data that should sync with store updates (React handles this automatically)

---

## Two-Phase Save System

**Pattern**: The system uses a two-phase save approach: immediate store update, then later database commit.

**Phase 1: Store Update (Immediate)**
```typescript
await saveData(payload);
// → Updates Zustand store immediately
// → Component re-renders automatically with new data prop
// → UI updates instantly
```

**Phase 2: Database Commit (Later)**
```typescript
commitConfig();
// → Reads from store
// → Creates signed file
// → Saves to Supabase storage (database)
```

**Why**:
- **Immediate UI updates**: Store updates trigger re-renders right away
- **Offline support**: Changes persist locally even if DB is unavailable
- **Batch commits**: Multiple changes can be batched before committing
- **Undo/rollback**: Can reset to `remoteSpaces` if needed

**Key Points**:
- `saveData()` updates the store immediately (not the database)
- Store is the source of truth for the UI
- Database commit happens separately via `commitConfig()`
- Component reads from store via `data` prop
- Store updates automatically trigger component re-renders

---

## Change Detection Before Persistence

**Pattern**: Use `isEqual` (lodash) to detect actual changes before calling `saveData`, comparing against the current `data` prop from the store.

```typescript
const persistDataIfChanged = useCallback(
  async (payload: FidgetData) => {
    // Compare against current data prop (from store)
    const currentData = data ?? {
      items: [],
      lastUpdatedTimestamp: null,
      metadata: null,
      lastFetchSettings: undefined,
    };

    const hasChanged =
      !isEqual(currentData.items, payload.items) ||
      currentData.lastUpdatedTimestamp !== payload.lastUpdatedTimestamp ||
      !isEqual(currentData.metadata, payload.metadata) ||
      !isEqual(currentData.lastFetchSettings, payload.lastFetchSettings);

    if (hasChanged) {
      await saveData(payload);
      // Store updates automatically → component re-renders with new data prop
    }
  },
  [data, saveData],
);
```

**Why**:
- Reduces unnecessary persistence calls
- Prevents infinite update loops
- Improves performance
- Only triggers store updates when necessary

**Key Points**:
- Compare against `data` prop (from store), not local state
- Use `isEqual` for deep object comparisons
- Use `===` for primitive values (timestamps, IDs)
- Include all relevant data fields in change detection
- Store update triggers automatic re-render - no manual state update needed

---

## AbortController for Async Operations

**Pattern**: Use `AbortController` to cancel in-flight requests on unmount or when starting new fetches.

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

// Cleanup on unmount
useEffect(() => {
  return () => {
    abortControllerRef.current?.abort();
  };
}, []);

// In fetch function
const fetchData = useCallback(async () => {
  // Abort any in-flight request
  abortControllerRef.current?.abort();
  const controller = new AbortController();
  abortControllerRef.current = controller;

  try {
    const response = await fetch('/api/endpoint', { 
      signal: controller.signal 
    });
    // ... handle response
  } catch (err) {
    // Ignore AbortError - it's expected when cancelling
    if ((err as Error).name === "AbortError") {
      return;
    }
    // Handle other errors
    throw err;
  }
}, []);
```

**Why**:
- Prevents memory leaks from pending promises
- Avoids race conditions when settings change quickly
- Cancels unnecessary network requests
- Prevents state updates after unmount

**Key Points**:
- Store controller in `useRef` to persist across renders
- Always abort previous controller before creating new one
- Ignore `AbortError` - it's expected behavior
- Pass `signal` to all async operations (fetch, axios, etc.)

---

## Error State Management

**Pattern**: Track error state separately and reset when settings change. No suppression needed - errors don't block future fetches.

```typescript
const [error, setError] = useState<string | null>(null);

// In fetch function
try {
  await fetchData(controller);
  setError(null);
} catch (err) {
  if ((err as Error).name === "AbortError") {
    return; // Expected when cancelling
  }
  setError(`Failed to load data: ${err.message}`);
  // No suppression - user can retry or change settings
}

// Reset error when settings change (gives fresh start)
useEffect(() => {
  setError(null);
}, [
  // List all settings that affect data fetching
  settings.source,
  settings.network,
  settings.contractAddress,
]);
```

**Why**:
- Allows user to see error messages
- Automatically recovers when settings change
- No suppression needed - React dependencies prevent infinite loops
- Provides better UX

**Key Points**:
- Separate error state from loading state
- Clear error state when settings change (gives fresh start)
- No suppression flag needed - React's dependency system prevents loops
- User can always retry via manual refresh or settings change

---

## Refresh Detection with React Dependencies (Simplified)

**Pattern**: Use React's dependency system to detect settings changes. No comparison logic needed - React automatically detects when dependencies change.

```typescript
// Fetch when fetch-relevant settings change - React dependencies detect changes automatically
const hasMountedRef = useRef(false);
useEffect(() => {
  if (source === "csv" || !isConfigured || isRefreshing) {
    return;
  }

  // On initial mount, only fetch if we don't have data yet
  if (!hasMountedRef.current) {
    hasMountedRef.current = true;
    const hasData = data?.lastUpdatedTimestamp != null;
    if (!hasData) {
      void fetchData();
    }
    return;
  }

  // After mount, any change to these dependencies means settings changed - fetch immediately
  void fetchData();
}, [
  source,
  network,
  normalizedAddress,
  assetType,
  debouncedChannelName,
  settings.channelFilter,
  isConfigured,
  isRefreshing,
  fetchData,
  // Note: data?.lastUpdatedTimestamp NOT in deps - we don't want to fetch when data updates
]);

// When fetching, save the settings snapshot (for backfill system)
await persistDataIfChanged({
  items: fetchedItems,
  lastUpdatedTimestamp: new Date().toISOString(),
  lastFetchSettings: {
    source: settings.source,
    network: settings.network,
    contractAddress: normalizedAddress,
  },
});
```

**Why**:
- **Simpler**: No comparison logic needed - React handles change detection
- **More reliable**: React's dependency system is battle-tested
- **Immediate**: Settings changes trigger fetches immediately
- **Works with backfill**: `lastFetchSettings` still saved for `FidgetWrapper`'s backfill system

**Key Points**:
- Watch fetch-relevant settings directly via React dependencies
- Use `hasMountedRef` to prevent fetch on initial mount if data exists
- Don't include `data?.lastUpdatedTimestamp` in deps (would trigger on every data update)
- Still save `lastFetchSettings` for the backfill system (used by `FidgetWrapper`)
- Separate effect for staleness detection (see next pattern)

---

## Staleness Detection

**Pattern**: Use a separate `useEffect` to watch the timestamp and refresh if data becomes stale. Keep this separate from settings change detection.

```typescript
const STALE_AFTER_MS = 60 * 60 * 1000; // 1 hour

// Separate effect for staleness check - only runs when timestamp changes
useEffect(() => {
  if (source === "csv" || !isConfigured || isRefreshing) {
    return;
  }

  const lastUpdated = data?.lastUpdatedTimestamp
    ? Date.parse(data.lastUpdatedTimestamp)
    : 0;
  if (lastUpdated > 0) {
    const isStale = Date.now() - lastUpdated > STALE_AFTER_MS;
    if (isStale) {
      void fetchData();
    }
  }
}, [
  source,
  isConfigured,
  isRefreshing,
  data?.lastUpdatedTimestamp, // Watch timestamp from store
  fetchData,
]);
```

**Why**:
- Ensures data doesn't become too stale
- Provides automatic background refresh
- Works independently of settings changes
- Improves data freshness
- Separate from settings change detection for clarity

**Key Points**:
- Use a separate `useEffect` for staleness (don't mix with settings change detection)
- Watch `data?.lastUpdatedTimestamp` from the store (not local state)
- Use a reasonable staleness threshold (e.g., 1 hour)
- Only refresh if not already refreshing
- Keep it simple - just check if timestamp is stale
- Always save timestamp when fetching: `new Date().toISOString()`
- Use ISO string format for consistency

---

## Debouncing User Input

**Pattern**: Debounce user input that triggers fetches to avoid excessive API calls.

```typescript
const DEBOUNCE_MS = 800;

const [inputValue, setInputValue] = useState(settings.inputValue ?? "");
const [debouncedInputValue, setDebouncedInputValue] = useState(inputValue);

useEffect(() => {
  if (source !== "inputBased") {
    setDebouncedInputValue(inputValue);
    return;
  }
  
  const timer = setTimeout(() => {
    setDebouncedInputValue(inputValue);
  }, DEBOUNCE_MS);
  
  return () => clearTimeout(timer);
}, [inputValue, source]);

// Use debouncedInputValue in shouldRefresh and fetch functions
```

**Why**:
- Reduces API calls while user is typing
- Improves performance
- Better user experience
- Saves bandwidth

**Key Points**:
- Only debounce for user input (not programmatic changes)
- Clear timeout on unmount
- Use debounced value in refresh detection
- Adjust debounce time based on expected input speed

---

## Loading State Management

**Pattern**: Track loading state separately from data state, manage it around async operations.

```typescript
const [isRefreshing, setIsRefreshing] = useState(false);

const fetchData = useCallback(async () => {
  setIsRefreshing(true);
  setError(null);

  try {
    await fetchData(controller);
  } catch (err) {
    // ... handle error
  } finally {
    setIsRefreshing(false);
  }
}, []);

// Prevent concurrent fetches
useEffect(() => {
  if (shouldRefresh && !isRefreshing && !suppressAutoRefresh) {
    void fetchData();
  }
}, [shouldRefresh, isRefreshing, suppressAutoRefresh, fetchData]);
```

**Why**:
- Prevents duplicate concurrent fetches
- Allows UI to show loading indicators
- Separates loading state from error state
- Prevents race conditions

**Key Points**:
- Set loading to `true` at start of fetch
- Always set to `false` in `finally` block
- Check `!isRefreshing` before starting new fetch
- Reset error state when starting new fetch

---

## Settings Change Reset Pattern

**Pattern**: Reset error state and suppression flags when settings that affect fetching change.

```typescript
// Reset error state when relevant settings change
useEffect(() => {
  setSuppressAutoRefresh(false);
  setError(null);
}, [
  // List ALL settings that affect data fetching
  settings.source,
  settings.network,
  settings.contractAddress,
  settings.channelName,
  // ... other relevant settings
]);
```

**Why**:
- Gives fresh start when user changes settings
- Clears stale error messages
- Allows auto-refresh to resume
- Better UX - user doesn't see old errors

**Key Points**:
- Include ALL settings that affect fetching
- Reset both error and suppression flag
- This should run before the refresh detection logic
- Consider debounced values if applicable

---

## Complete Example Pattern

Here's a complete example combining all patterns:

```typescript
interface MyFidgetData extends FidgetData {
  items: Item[];
  lastUpdatedTimestamp?: string | null;
  lastFetchSettings?: Partial<MyFidgetSettings>;
}

const STALE_AFTER_MS = 60 * 60 * 1000; // 1 hour

const MyFidget: React.FC<FidgetArgs<MyFidgetSettings, MyFidgetData>> = ({
  settings,
  data,
  saveData,
}) => {
  // 1. Local State Management
  const [fidgetData, setFidgetData] = useState<MyFidgetData>(() => ({
    items: data?.items ?? [],
    lastUpdatedTimestamp: data?.lastUpdatedTimestamp ?? null,
    lastFetchSettings: data?.lastFetchSettings,
  }));

  // 2. Data Synchronization
  useEffect(() => {
    setFidgetData((prev) => ({
      items: data?.items ?? prev.items,
      lastUpdatedTimestamp: data?.lastUpdatedTimestamp ?? prev.lastUpdatedTimestamp ?? null,
      lastFetchSettings: data?.lastFetchSettings ?? prev.lastFetchSettings,
    }));
  }, [data?.items, data?.lastUpdatedTimestamp, data?.lastFetchSettings]);

  // AbortController
  const abortControllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Loading & Error States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppressAutoRefresh, setSuppressAutoRefresh] = useState(false);

  // 3. Change Detection Before Persistence
  const persistDataIfChanged = useCallback(
    async (payload: MyFidgetData) => {
      const hasChanged =
        !isEqual(fidgetData.items, payload.items) ||
        fidgetData.lastUpdatedTimestamp !== payload.lastUpdatedTimestamp ||
        !isEqual(fidgetData.lastFetchSettings, payload.lastFetchSettings);

      setFidgetData(payload);

      if (hasChanged) {
        await saveData(payload);
      }
    },
    [fidgetData, saveData],
  );

  // 4. Refresh Detection
  const shouldRefresh = useMemo(() => {
    if (!isConfigured) {
      return false;
    }

    const lastFetch = fidgetData.lastFetchSettings;
    const lastUpdated = fidgetData.lastUpdatedTimestamp
      ? Date.parse(fidgetData.lastUpdatedTimestamp)
      : 0;

    if (!lastFetch || !lastUpdated) {
      return true;
    }

    const currentFetchSettings: Partial<MyFidgetSettings> = {
      source: settings.source,
      network: settings.network,
      // ... other relevant settings
    };

    if (!isEqual(currentFetchSettings, lastFetch)) {
      return true;
    }

    return Date.now() - lastUpdated > STALE_AFTER_MS;
  }, [
    fidgetData.lastFetchSettings,
    fidgetData.lastUpdatedTimestamp,
    isConfigured,
    settings.source,
    settings.network,
    // ... other settings
  ]);

  // 5. Fetch Function
  const fetchData = useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch('/api/endpoint', {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const fetchedItems = await response.json();

      await persistDataIfChanged({
        items: fetchedItems,
        lastUpdatedTimestamp: new Date().toISOString(),
        lastFetchSettings: {
          source: settings.source,
          network: settings.network,
          // ... other relevant settings
        },
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return;
      }
      setError(`Failed to load data: ${err.message}`);
      setSuppressAutoRefresh(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [isConfigured, settings, persistDataIfChanged]);

  // 6. Auto-refresh Effect
  useEffect(() => {
    if (shouldRefresh && !isRefreshing && !suppressAutoRefresh) {
      void fetchData();
    }
  }, [shouldRefresh, isRefreshing, suppressAutoRefresh, fetchData]);

  // 7. Settings Change Reset
  useEffect(() => {
    setSuppressAutoRefresh(false);
    setError(null);
  }, [
    settings.source,
    settings.network,
    // ... all settings that affect fetching
  ]);

  // Render UI...
};
```

---

## Summary

These patterns provide:

1. **Reliability**: Proper cleanup, error handling, and state management
2. **Performance**: Change detection, debouncing, abort controllers
3. **User Experience**: Loading states, error messages, automatic refresh
4. **Maintainability**: Clear patterns, predictable behavior
5. **Integration**: Works seamlessly with `FidgetWrapper` and space config system

Not all fidgets need all patterns. Choose based on your fidget's requirements:
- **Simple fidgets** (no async data): Skip async patterns
- **Read-only fidgets**: Skip persistence patterns
- **Real-time fidgets**: May skip staleness detection
- **User-input fidgets**: Include debouncing
- **Complex fidgets**: Use all patterns

