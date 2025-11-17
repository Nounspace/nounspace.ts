# Fidget Data Field Patterns

This document outlines essential patterns for fidgets that use the `data` field in `FidgetConfig` to store runtime state and cached data. These patterns are derived from the Directory fidget implementation and should be considered best practices.

## Table of Contents

1. [Local State Management](#local-state-management)
2. [Data Synchronization](#data-synchronization)
3. [Change Detection Before Persistence](#change-detection-before-persistence)
4. [AbortController for Async Operations](#abortcontroller-for-async-operations)
5. [Error State Management](#error-state-management)
6. [Refresh Detection with lastFetchSettings](#refresh-detection-with-lastfetchsettings)
7. [Staleness Detection](#staleness-detection)
8. [Debouncing User Input](#debouncing-user-input)
9. [Loading State Management](#loading-state-management)
10. [Settings Change Reset Pattern](#settings-change-reset-pattern)

---

## Local State Management

**Pattern**: Initialize local state from props with proper fallbacks, allowing for local updates while keeping external data as source of truth.

```typescript
const [fidgetData, setFidgetData] = useState<FidgetData>(() => ({
  // Provide defaults for all data fields
  items: data?.items ?? [],
  lastUpdatedTimestamp: data?.lastUpdatedTimestamp ?? null,
  metadata: data?.metadata ?? null,
  lastFetchSettings: data?.lastFetchSettings,
}));
```

**Why**: 
- Prevents undefined access errors
- Allows local state updates without immediately persisting
- Provides initialization from persisted data

**Key Points**:
- Use function initializer `() => ({ ... })` for performance
- Always provide sensible defaults
- Include `lastFetchSettings` if you use refresh detection

---

## Data Synchronization

**Pattern**: Use `useEffect` to sync external `data` prop changes to local state, preserving local updates when external data hasn't changed.

```typescript
useEffect(() => {
  setFidgetData((prev) => ({
    // Only update if external data exists, otherwise keep local state
    items: data?.items ?? prev.items,
    lastUpdatedTimestamp: data?.lastUpdatedTimestamp ?? prev.lastUpdatedTimestamp ?? null,
    metadata: data?.metadata ?? prev.metadata,
    lastFetchSettings: data?.lastFetchSettings ?? prev.lastFetchSettings,
  }));
}, [
  data?.items,
  data?.lastUpdatedTimestamp,
  data?.metadata,
  data?.lastFetchSettings,
]);
```

**Why**:
- External data prop can change from:
  - Remote database loads
  - Space config resets
  - Other fidget instances updating shared state
- Prevents losing local state unnecessarily
- Ensures UI stays in sync with persisted data

**Key Points**:
- Use `prev` fallback pattern to preserve local state
- Depend on specific data fields, not the entire `data` object
- Handle `null` vs `undefined` appropriately

---

## Change Detection Before Persistence

**Pattern**: Use `isEqual` (lodash) to detect actual changes before calling `saveData`, avoiding unnecessary persistence operations.

```typescript
const persistDataIfChanged = useCallback(
  async (payload: FidgetData) => {
    const hasChanged =
      !isEqual(fidgetData.items, payload.items) ||
      fidgetData.lastUpdatedTimestamp !== payload.lastUpdatedTimestamp ||
      !isEqual(fidgetData.metadata, payload.metadata) ||
      !isEqual(fidgetData.lastFetchSettings, payload.lastFetchSettings);

    setFidgetData(payload);

    if (hasChanged) {
      await saveData(payload);
    }
  },
  [fidgetData, saveData],
);
```

**Why**:
- Reduces unnecessary persistence calls
- Prevents infinite update loops
- Improves performance
- Only triggers space config updates when necessary

**Key Points**:
- Use `isEqual` for deep object comparisons
- Use `===` for primitive values (timestamps, IDs)
- Update local state first, then persist if changed
- Include all relevant data fields in change detection

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

**Pattern**: Track error state separately, suppress auto-refresh on errors, and reset when settings change.

```typescript
const [error, setError] = useState<string | null>(null);
const [suppressAutoRefresh, setSuppressAutoRefresh] = useState(false);

// In fetch function
try {
  await fetchData(controller);
  setError(null);
} catch (err) {
  if ((err as Error).name === "AbortError") {
    return;
  }
  setError(`Failed to load data: ${err.message}`);
  setSuppressAutoRefresh(true); // Prevent infinite retry loop
}

// Reset error when settings change
useEffect(() => {
  setSuppressAutoRefresh(false);
  setError(null);
}, [
  // List all settings that affect data fetching
  settings.source,
  settings.network,
  settings.contractAddress,
]);
```

**Why**:
- Prevents infinite retry loops on persistent errors
- Allows user to see error messages
- Automatically recovers when settings change
- Provides better UX

**Key Points**:
- Separate error state from loading state
- Suppress auto-refresh on errors
- Reset suppression when relevant settings change
- Clear error state when settings change (gives fresh start)

---

## Refresh Detection with lastFetchSettings

**Pattern**: Store a snapshot of settings used for the last fetch, compare with current settings to detect changes.

```typescript
interface FidgetData extends FidgetData {
  items: Item[];
  lastUpdatedTimestamp?: string | null;
  lastFetchSettings?: Partial<FidgetSettings>; // Snapshot of settings
}

// Extract relevant settings for comparison
const shouldRefresh = useMemo(() => {
  if (!isConfigured) {
    return false;
  }

  const lastFetch = fidgetData.lastFetchSettings;
  const lastUpdated = fidgetData.lastUpdatedTimestamp
    ? Date.parse(fidgetData.lastUpdatedTimestamp)
    : 0;

  // If no previous fetch, need to fetch
  if (!lastFetch || !lastUpdated) {
    return true;
  }

  // Extract only settings that affect data fetching
  const currentFetchSettings: Partial<FidgetSettings> = {
    source: settings.source,
    network: settings.network,
    contractAddress: normalizedAddress,
    // ... other relevant settings
  };

  // If settings changed, need refresh
  if (!isEqual(currentFetchSettings, lastFetch)) {
    return true;
  }

  // Otherwise check staleness
  return Date.now() - lastUpdated > STALE_AFTER_MS;
}, [
  fidgetData.lastFetchSettings,
  fidgetData.lastUpdatedTimestamp,
  isConfigured,
  // ... all settings used in currentFetchSettings
]);

// When fetching, save the settings snapshot
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
- Detects when settings change (user input, URL params, etc.)
- Avoids unnecessary fetches when only display settings change
- Works with `FidgetWrapper`'s automatic settings backfill
- Provides clear separation between data-fetching settings and display settings

**Key Points**:
- Only include settings that affect data fetching
- Use `isEqual` for comparison (deep object comparison)
- Store normalized values (e.g., lowercase addresses)
- Update `lastFetchSettings` every time you fetch

---

## Staleness Detection

**Pattern**: Use timestamps to determine if cached data is stale and needs refresh.

```typescript
const STALE_AFTER_MS = 60 * 60 * 1000; // 1 hour

const shouldRefresh = useMemo(() => {
  // ... check if settings changed first ...
  
  const lastUpdated = fidgetData.lastUpdatedTimestamp
    ? Date.parse(fidgetData.lastUpdatedTimestamp)
    : 0;

  if (!lastUpdated) {
    return true; // No data yet
  }

  // Check if data is stale
  return Date.now() - lastUpdated > STALE_AFTER_MS;
}, [fidgetData.lastUpdatedTimestamp, /* ... */]);
```

**Why**:
- Automatically refreshes stale data
- Prevents showing outdated information
- Configurable staleness threshold per fidget type
- Works in conjunction with settings change detection

**Key Points**:
- Always save timestamp when fetching: `new Date().toISOString()`
- Use ISO string format for consistency
- Choose appropriate staleness threshold for your data type
- Combine with settings change detection

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

