# Tab Management System Documentation

## Overview

The Nounspace application uses a sophisticated tab management system that handles both private spaces (homebase) and public spaces with different architectural approaches optimized for their specific use cases. This document outlines the system architecture, state management patterns, and implementation details.

## Table of Contents

- [System Architecture](#system-architecture)
- [Store Comparison](#store-comparison)
- [State Management Patterns](#state-management-patterns)
- [Tab Operations](#tab-operations)
- [Optimistic Updates](#optimistic-updates)
- [Component Integration](#component-integration)
- [Performance Considerations](#performance-considerations)
- [Security Model](#security-model)
- [Migration Guide](#migration-guide)

## System Architecture

### Core Components

1. **Store Layer**
   - `homebaseStore` + `homebaseTabsStore` - Private, encrypted spaces
   - `spaceStore` - Public, multi-user spaces

2. **Component Layer**
   - `TabBar` - Reusable tab management component
   - `PrivateSpace` - Homebase space container
   - `PublicSpace` - Public space container
   - `SpacePage` - Generic space renderer

3. **Utility Layer**
   - `tabUtils.ts` - Shared utilities and patterns
   - Validation functions
   - Optimistic update helpers

### State Flow

```
URL Params → Store Sync → Tab Loading → Config Resolution → UI Render
     ↓            ↓            ↓              ↓              ↓
  tabName → currentTabName → loadTab → getConfig → SpacePage
```

## Store Comparison

### Homebase Store (Private Spaces)

**Purpose**: Single-user, encrypted, private spaces

**State Structure**:
```typescript
homebase: {
  homebaseConfig: SpaceConfig,        // Main config
  remoteHomebaseConfig: SpaceConfig,  // Remote backup
  tabs: {
    [tabName]: {
      config: SpaceConfig,            // Local config
      remoteConfig: SpaceConfig       // Remote backup
    }
  },
  tabOrdering: {
    local: string[],                  // Local order
    remote: string[]                  // Remote order
  }
}
```

**Key Characteristics**:
- ✅ Encrypted storage (Supabase Private)
- ✅ Single user only
- ✅ Simple local/remote state pattern
- ✅ Direct API endpoints
- ✅ Timestamp-based conflict resolution

### Space Store (Public Spaces)

**Purpose**: Multi-user, public, shared spaces

**State Structure**:
```typescript
space: {
  remoteSpaces: Record<string, CachedSpace>,    // All remote spaces
  editableSpaces: Record<string, string>,       // User's editable spaces
  localSpaces: Record<string, LocalSpace>       // Local changes
}

// Where LocalSpace extends CachedSpace:
LocalSpace: {
  id: string,
  tabs: { [tabName]: UpdatableSpaceConfig },
  order: string[],
  changedNames: { [newName]: string },          // Track renames
  contractAddress?: string,
  network?: string,
  // ... other fields
}
```

**Key Characteristics**:
- ❌ Unencrypted storage (Supabase Public)
- ✅ Multi-user support
- ✅ Complex state management
- ✅ Registry API system
- ✅ Advanced conflict resolution

## State Management Patterns

### Centralized State Management

Both systems use the Zustand store with `currentSpaceId` and `currentTabName` as the single source of truth:

```typescript
// App Store
currentSpace: {
  currentSpaceId: string | null,
  currentTabName: string | null,
  setCurrentSpaceId: (id: string) => void,
  setCurrentTabName: (name: string) => void
}
```

### Component Integration Pattern

All space components follow this pattern:

```typescript
// 1. Sync URL params to store
useEffect(() => {
  setCurrentSpaceId(spaceId);
  setCurrentTabName(tabName);
}, [spaceId, tabName]);

// 2. Load data when store values change
useEffect(() => {
  if (currentSpaceId && currentTabName) {
    loadTab(currentSpaceId, currentTabName);
  }
}, [currentSpaceId, currentTabName]);

// 3. Use store values for rendering
const activeTabName = currentTabName || defaultTab;
```

## Tab Operations

### Tab Creation

#### Homebase Store
```typescript
async createTab(tabName: string) {
  // 1. Validate tab name
  const validationError = validateTabName(tabName);
  if (validationError) throw new Error(validationError);

  // 2. Create encrypted file
  const file = await createEncryptedSignedFile(config, { useRootKey: true });

  // 3. API call to register tab
  await axiosBackend.post("/api/space/homebase/tabs", { request, file });

  // 4. Update local state
  set((draft) => {
    draft.homebase.tabs[tabName] = { config, remoteConfig };
    draft.homebase.tabOrdering.local.push(tabName);
  });
}
```

#### Space Store
```typescript
async createSpaceTab(spaceId: string, tabName: string) {
  return withOptimisticUpdate({
    updateFn: () => {
      // Optimistically add to local state
      set((draft) => {
        draft.space.localSpaces[spaceId].tabs[tabName] = config;
        draft.space.localSpaces[spaceId].order.push(tabName);
      });
    },
    commitFn: async () => {
      // Register with backend
      await axiosBackend.post(`/api/space/registry/${spaceId}/tabs`, request);
    },
    rollbackFn: () => {
      // Remove from local state on error
      set((draft) => {
        delete draft.space.localSpaces[spaceId].tabs[tabName];
        draft.space.localSpaces[spaceId].order = draft.space.localSpaces[spaceId].order.filter(name => name !== tabName);
      });
    }
  });
}
```

### Tab Renaming

Both stores use the `withOptimisticUpdate` pattern for renaming:

```typescript
async renameTab(oldName: string, newName: string) {
  return withOptimisticUpdate({
    updateFn: () => {
      // Optimistically update UI
      set((draft) => {
        // Move tab data
        draft.tabs[newName] = draft.tabs[oldName];
        delete draft.tabs[oldName];
        
        // Update order
        draft.order = draft.order.map(name => name === oldName ? newName : name);
        
        // Update current tab if needed
        if (draft.currentTabName === oldName) {
          draft.currentTabName = newName;
        }
      });
    },
    commitFn: async () => {
      // Commit to backend
      await commitTabToDatabase(newName);
    },
    rollbackFn: () => {
      // Rollback on error
      set((draft) => {
        draft.tabs[oldName] = draft.tabs[newName];
        delete draft.tabs[newName];
        draft.order = previousOrder;
      });
    }
  });
}
```

### Tab Deletion

#### Homebase Store
```typescript
async deleteTab(tabName: string) {
  // Direct API call
  const response = await axiosBackend.post("/api/space/homebase/tabs", deleteRequest);
  
  if (response.data.result === "success") {
    set((draft) => {
      delete draft.homebase.tabs[tabName];
      draft.homebase.tabOrdering.local = draft.homebase.tabOrdering.local.filter(name => name !== tabName);
    });
  }
}
```

#### Space Store
```typescript
async deleteSpaceTab(spaceId: string, tabName: string) {
  return withOptimisticUpdate({
    updateFn: () => {
      set((draft) => {
        delete draft.space.localSpaces[spaceId].tabs[tabName];
        draft.space.localSpaces[spaceId].order = draft.space.localSpaces[spaceId].order.filter(name => name !== tabName);
      });
    },
    commitFn: async () => {
      await axiosBackend.delete(`/api/space/registry/${spaceId}/tabs/${tabName}`);
    },
    rollbackFn: () => {
      // Restore tab data
      set((draft) => {
        draft.space.localSpaces[spaceId].tabs[tabName] = previousTabState;
        draft.space.localSpaces[spaceId].order = previousOrder;
      });
    }
  });
}
```

## Optimistic Updates

### Pattern Overview

The `withOptimisticUpdate` utility provides a standardized pattern for optimistic UI updates:

```typescript
interface OptimisticUpdateConfig<T> {
  updateFn: () => void;                    // Immediate UI update
  commitFn: () => Promise<T>;              // Background backend operation
  rollbackFn: () => void;                  // Error rollback
  errorConfig?: {                          // Error handling
    title: string;
    message: string;
  };
}
```

### Implementation

```typescript
export const withOptimisticUpdate = async <T>({
  updateFn,
  commitFn,
  rollbackFn,
  errorConfig = {
    title: "Operation Failed",
    message: "The operation failed. Changes have been reverted."
  }
}: OptimisticUpdateConfig<T>): Promise<T> => {
  try {
    // 1. Update UI immediately
    updateFn();
    
    // 2. Perform backend operation
    const result = await commitFn();
    
    return result;
  } catch (error) {
    // 3. Rollback on error
    rollbackFn();
    
    // 4. Show error message
    toast.error(errorConfig.message);
    
    throw error;
  }
};
```

### Benefits

1. **Instant UI Response**: Users see changes immediately
2. **Error Recovery**: Automatic rollback on failure
3. **Consistent UX**: Standardized error handling
4. **Reduced Complexity**: Reusable pattern across operations

## Component Integration

### TabBar Component

The `TabBar` component is shared between both homebase and public spaces:

```typescript
interface TabBarProps {
  currentTab: string;                    // Current active tab
  tabList: string[];                     // Available tabs
  defaultTab: string;                    // Non-deletable default tab
  inHomebase: boolean;                   // Context flag
  isEditable: boolean;                   // Edit permissions
  createTab: (name: string) => Promise<{ tabName: string }>;
  deleteTab: (name: string) => Promise<void>;
  renameTab: (oldName: string, newName: string) => Promise<void>;
  updateTabOrder: (order: string[]) => Promise<void>;
  commitTabOrder: () => Promise<void>;
  // ... other props
}
```

### Space Components

#### PrivateSpace Component
```typescript
function PrivateSpace({ tabName }: { tabName: string }) {
  const { currentTabName, setCurrentTabName } = useAppStore();
  
  // Sync URL to store
  useEffect(() => {
    setCurrentTabName(tabName);
  }, [tabName]);
  
  // Use store value for rendering
  const activeTabName = currentTabName || "Feed";
  
  return <SpacePage key={activeTabName} {...args} />;
}
```

#### PublicSpace Component
```typescript
function PublicSpace({ spacePageData, providedTabName }) {
  const { currentSpaceId, currentTabName } = useAppStore();
  
  // Compute active values with fallbacks
  const activeSpaceId = currentSpaceId ?? spacePageData.spaceId ?? null;
  const activeTabName = currentTabName || providedTabName || spacePageData.defaultTab;
  
  // Config resolution with Suspense support
  const config = activeTabName && currentConfig?.tabs?.[activeTabName] 
    ? { ...currentConfig.tabs[activeTabName], isEditable }
    : !activeSpaceId 
      ? { ...spacePageData.config, isEditable }
      : undefined; // Triggers Suspense
  
  return <SpacePage {...args} config={config} />;
}
```

## Performance Considerations

### Debouncing

Both stores use debouncing for frequent operations:

```typescript
// Tab order updates
const debouncedReorder = debounce((newOrder) => {
  updateTabOrder(newOrder);
  commitTabOrder();
}, 300);

// Tab creation
const debouncedCreateTab = debounce(async (tabName) => {
  await createTab(tabName);
}, 300);
```

### Lazy Loading

Components use lazy loading for performance:

```typescript
// Lazy load TabBar
const TabBar = lazy(() => import('@/common/components/organisms/TabBar'));

// Lazy load space components
const SpacePage = lazy(() => import('./SpacePage'));
```

### Memoization

Heavy computations are memoized:

```typescript
// Memoize TabBar to prevent unnecessary re-renders
const tabBar = useMemo(() => (
  <TabBar {...props} />
), [currentTabName, tabOrdering, editMode]);

// Memoize SpacePage args
const args = useMemo(() => ({
  config: getConfig(),
  tabBar,
  // ... other props
}), [currentTabName, config, tabBar]);
```

## Security Model

### Homebase (Private Spaces)

- **Encryption**: All data encrypted with user's root key
- **Storage**: Supabase Private Storage (encrypted at rest)
- **Access**: Single user only
- **Authentication**: Cryptographic signatures

### Public Spaces

- **Encryption**: None (public data)
- **Storage**: Supabase Public Storage
- **Access**: Multi-user, public
- **Authentication**: API-based permissions

## Migration Guide

### From Local State to Store State

**Before (Local State)**:
```typescript
const [tabName, setTabName] = useState("Feed");

// Problems:
// - State not synchronized across components
// - URL params can get out of sync
// - No centralized source of truth
```

**After (Store State)**:
```typescript
const { currentTabName, setCurrentTabName } = useAppStore();

// Benefits:
// - Centralized state management
// - Automatic synchronization
// - Consistent across all components
```

### From Synchronous to Optimistic Updates

**Before (Synchronous)**:
```typescript
const handleCreateTab = async (name: string) => {
  await createTab(name);        // Wait for backend
  switchTabTo(name);            // Then update UI
};
```

**After (Optimistic)**:
```typescript
const handleCreateTab = async (name: string) => {
  switchTabTo(name);            // Update UI immediately
  await createTab(name);        // Backend in background
};
```

## Best Practices

### 1. Always Use Store Values

```typescript
// ❌ Don't use props directly
function Component({ tabName }) {
  return <div>{tabName}</div>;
}

// ✅ Use store values with fallbacks
function Component({ tabName }) {
  const { currentTabName } = useAppStore();
  const activeTabName = currentTabName || tabName;
  return <div>{activeTabName}</div>;
}
```

### 2. Implement Proper Error Handling

```typescript
// ✅ Use withOptimisticUpdate for operations
return withOptimisticUpdate({
  updateFn: () => updateUI(),
  commitFn: () => backendOperation(),
  rollbackFn: () => revertUI(),
  errorConfig: {
    title: "Operation Failed",
    message: "Please try again."
  }
});
```

### 3. Use Debouncing for Frequent Operations

```typescript
// ✅ Debounce expensive operations
const debouncedSave = debounce(async (config) => {
  await saveConfig(config);
}, 300);
```

### 4. Implement Proper Loading States

```typescript
// ✅ Use Suspense for loading states
const config = isLoading ? undefined : getConfig();

return (
  <Suspense fallback={<LoadingSpinner />}>
    <SpacePage config={config} />
  </Suspense>
);
```

## Troubleshooting

### Common Issues

1. **Stale State**: Use computed values instead of memoized functions with function dependencies
2. **Race Conditions**: Implement proper dependency arrays and avoid stale closures
3. **Inconsistent Navigation**: Use `window.history.replaceState` instead of `router.push`
4. **Flash of Default Config**: Return `undefined` to trigger Suspense instead of fallback config

### Debug Tools

```typescript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
  console.log('Tab state:', {
    currentTabName,
    tabOrdering,
    config: getConfig()
  });
}
```

## Future Improvements

1. **Unified Store Interface**: Create a common interface for both stores
2. **Enhanced Caching**: Implement more sophisticated caching strategies
3. **Real-time Sync**: Add WebSocket support for real-time updates
4. **Offline Support**: Implement offline-first patterns with sync on reconnect
5. **Performance Monitoring**: Add metrics for tab operation performance

---

*Last updated: December 2024*
*Version: 1.0*
