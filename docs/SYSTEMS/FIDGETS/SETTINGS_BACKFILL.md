# Settings Backfill System

The settings backfill system automatically populates empty fidget settings from `lastFetchSettings` stored in `config.data`. This is useful when fidgets are created from external sources (e.g., URL parameters) and need to populate their settings.

## Overview

When a fidget is created programmatically (e.g., from URL parameters or external links), it may not have all its settings configured. The settings backfill system allows fidgets to automatically populate empty settings from a snapshot of settings used for the last data fetch.

## How It Works

### 1. Storing lastFetchSettings

When a fidget fetches data, it stores a snapshot of the settings used for that fetch in `config.data.lastFetchSettings`. This snapshot should include only the settings that are relevant to data fetching (like source, network, contract address, and asset type for token holders). The snapshot is saved using the `saveData` function provided to the fidget.

### 2. Automatic Backfill

The `FidgetWrapper` component automatically detects when `lastFetchSettings` exists in `config.data` and when current settings have empty values that can be filled from `lastFetchSettings`. It then creates derived settings by merging the current settings with values from `lastFetchSettings`, filling only empty values while preserving any existing non-empty settings.

### 3. Settings Persistence

After deriving the settings, `FidgetWrapper` automatically saves them back to the fidget configuration. This ensures that the backfilled settings are persisted and available on subsequent renders.

## Implementation Details

### Backfill Logic

The backfill system in `FidgetWrapper` follows these steps:

1. **Extracts `lastFetchSettings`** from `config.data` if it exists
2. **Derives settings** by merging current settings with `lastFetchSettings`
3. **Only fills empty values** - existing non-empty settings are preserved and never overwritten
4. **Trims strings** - string values are trimmed before being set to avoid whitespace issues
5. **Detects changes** - only saves if settings actually changed to avoid unnecessary persistence operations

The logic is memoized to prevent unnecessary recalculations and only runs when the underlying settings or `lastFetchSettings` change.

## Use Cases

### 1. URL Parameter Creation

When creating a fidget from URL parameters, the fidget may be initialized with minimal settings (e.g., just the source type). After the first data fetch, `lastFetchSettings` is stored with all the settings used for that fetch. On the next render, FidgetWrapper automatically backfills the empty settings from this snapshot, ensuring the fidget has all necessary configuration.

### 2. External Link Creation

When creating fidgets from external links or embeds, similar to URL parameters, the fidget may start with incomplete settings. When the user navigates away and returns, FidgetWrapper restores missing settings from `lastFetchSettings`, maintaining the fidget's configuration.

### 3. Settings Migration

During fidget refactoring or migration, when new settings are introduced, storing them in `lastFetchSettings` during the migration allows FidgetWrapper to automatically backfill them for existing fidget instances, ensuring backward compatibility.

## Best Practices

### 1. Store Relevant Settings Only

Only store settings that are actually used for data fetching. Avoid storing UI-only settings like layout style or sort options, as these don't affect what data is fetched and shouldn't trigger refreshes.

### 2. Normalize Values

Normalize values before storing in `lastFetchSettings`. For example, normalize addresses to a consistent format (lowercase, checksummed) to ensure proper comparison and refresh detection.

### 3. Use Partial Types

Type `lastFetchSettings` as `Partial<FidgetSettings>` to indicate that not all settings need to be present. This provides type safety while allowing flexibility.

### 4. Don't Overwrite User Settings

The backfill system only fills empty values. Existing user settings are always preserved. If a user has manually set a value, it will never be overwritten by the backfill system, even if `lastFetchSettings` contains a different value.

## Refresh Detection

The `lastFetchSettings` pattern is also used for refresh detection. By comparing the current settings (normalized and filtered to only fetch-relevant settings) with `lastFetchSettings`, the fidget can determine if a refresh is needed. If the settings differ, a refresh is triggered. Otherwise, the system checks if the data is stale based on the last update timestamp.

## Generic Pattern

Any fidget can use this pattern by:

1. **Storing `lastFetchSettings`** in `config.data` after fetching data
2. **Using generic structure** - `FidgetWrapper` handles the rest automatically
3. **No fidget-specific code needed** - the system is fully generic

## Limitations

### 1. Only Fills Empty Values

The system only fills empty (`undefined`, `null`, or empty string) values. It will not overwrite existing settings.

### 2. Requires Data Fetch

`lastFetchSettings` is only stored after a data fetch. If a fidget is created but never fetches data, backfill won't occur.

### 3. String Trimming

String values are trimmed. Empty strings after trimming are not set.

### 4. One-Time Backfill

Backfill occurs once when settings are detected as different. Subsequent renders won't trigger backfill unless settings change.

## Troubleshooting

### Backfill Not Working

1. **Check `lastFetchSettings` exists**: Verify it's stored in `config.data`
2. **Check settings are empty**: Backfill only fills empty values
3. **Check `FidgetWrapper`**: Ensure fidget is wrapped by `FidgetWrapper`
4. **Check console**: Look for backfill errors in console

### Settings Being Overwritten

The backfill system should never overwrite existing settings. If this happens:
1. Check that settings are actually non-empty
2. Verify `setValue` logic in `FidgetWrapper`
3. Check for race conditions

### Performance Issues

If backfill causes performance issues:
1. Check `useMemo` dependencies
2. Verify `isEqual` comparison is efficient
3. Consider debouncing backfill attempts

## Related Documentation

- [Fidget Overview](OVERVIEW.md) - General fidget architecture
- [Data Field Patterns](DATA_FIELD_PATTERNS.md) - Patterns for using config.data
- [Directory Fidget](DIRECTORY.md) - Example implementation using backfill

