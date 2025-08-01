# Mobile Drag-and-Drop System

## Overview

This document explains how the drag-and-drop system works for fidget reordering on mobile version.

## System Architecture

### Involved Components

```typescript
MobileSettings.tsx (Interface)
    ↓ callback
ThemeSettingsEditor.tsx (State Management)
    ↓ save
layoutDetails.layouts.mobile.fidgetOrder (Persistence)
    ↓ read
Space.tsx (Order Application)
    ↓ props
MobileViewSimplified.tsx (Rendering)
```

## Complete Flow

### 1. User Interaction

```typescript
// In MobileSettings.tsx
const handleDragEnd = (result: DropResult) => {
  if (!result.destination) return;
  
  const newOrder = reorder(
    miniApps,
    result.source.index,
    result.destination.index
  );
  
  // Callback to ThemeSettingsEditor
  onMiniAppsChange(newOrder);
};
```

### 2. State Processing

```typescript
// In ThemeSettingsEditor.tsx
const handleMiniAppsChange = (newMiniApps: MiniApp[]) => {
  // Update order in mobile layout
  const newMobileOrder = newMiniApps.map(app => app.id);
  
  const updatedLayoutDetails = {
    ...layoutDetails,
    layouts: {
      ...layoutDetails.layouts,
      mobile: {
        ...layoutDetails.layouts.mobile,
        fidgetOrder: newMobileOrder
      }
    }
  };
  
  saveLayoutDetails(updatedLayoutDetails);
};
```

### 3. New Order Application

```typescript
// In Space.tsx
const getSortedFidgetIds = (fidgetInstanceDatums, mobileLayout) => {
  if (mobileLayout?.fidgetOrder) {
    // Use explicit mobile layout order
    return mobileLayout.fidgetOrder.filter(id => 
      fidgetInstanceDatums[id]
    );
  }
  
  // Fallback to default order (migration)
  return Object.keys(fidgetInstanceDatums).sort((a, b) => {
    const aOrder = fidgetInstanceDatums[a]?.config?.settings?.mobileOrder || 0;
    const bOrder = fidgetInstanceDatums[b]?.config?.settings?.mobileOrder || 0;
    return aOrder - bOrder;
  });
};
```

### 4. Final Rendering

```typescript
// In MobileViewSimplified.tsx
const sortedFidgetIds = getSortedFidgetIds(
  fidgetInstanceDatums, 
  mobileLayout
);

return (
  <LayoutFidgets
    fidgetInstanceIds={sortedFidgetIds}
    // ...other props
  />
);
```

## Drag-and-Drop Interface

### Component Structure

```typescript
// MobileSettings.tsx
<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="mobile-fidgets">
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        {miniApps.map((miniApp, index) => (
          <Draggable 
            key={`miniapp-${miniApp.id}`}
            draggableId={miniApp.id}
            index={index}
          >
            {/* Fidget interface */}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

### States During Drag

1. **Idle**: Normal interface, ready for interaction
2. **Dragging**: User is dragging an item
3. **Updating**: Processing order change
4. **Persisting**: Saving new configuration

## Migration from Old System

### Identified Problem

**Before PR #1279:**

```typescript
// Order stored individually in each fidget
fidgetInstanceDatums[id].config.settings.mobileOrder = index;

// Problem: Space.tsx didn't apply ordering
const fidgetIds = Object.keys(config.fidgetInstanceDatums);
// Non-deterministic order!
```

### Implemented Solution

**After PR #1279:**

```typescript
// Centralized order in layout
layoutDetails.layouts.mobile.fidgetOrder = ['fidget1', 'fidget2', 'fidget3'];

// Space.tsx applies ordering explicitly
const fidgetIds = getSortedFidgetIds(fidgetInstanceDatums, mobileLayout);
// Deterministic and persistent order!
```

## Edge Cases Handling

### 1. Removed Fidgets

```typescript
// Filter IDs that no longer exist
const validFidgetIds = mobileLayout.fidgetOrder.filter(id => 
  fidgetInstanceDatums[id]
);
```

### 2. New Fidgets

```typescript
// Add new fidgets at the end
const existingIds = new Set(mobileLayout.fidgetOrder);
const newFidgets = Object.keys(fidgetInstanceDatums)
  .filter(id => !existingIds.has(id));

const updatedOrder = [...mobileLayout.fidgetOrder, ...newFidgets];
```

### 3. Non-Migrated Layout

```typescript
// Fallback to old system during migration
if (!mobileLayout?.fidgetOrder) {
  return Object.keys(fidgetInstanceDatums).sort((a, b) => {
    const aOrder = fidgetInstanceDatums[a]?.config?.settings?.mobileOrder || 0;
    const bOrder = fidgetInstanceDatums[b]?.config?.settings?.mobileOrder || 0;
    return aOrder - bOrder;
  });
}
```

## Feed Integration

### Automatic Feed Injection

```typescript
// In processTabFidgetIds (layoutUtils.ts)
const processedIds = [...fidgetOrder];

if (isHomebasePath && !processedIds.includes('feed')) {
  // Add feed at the beginning for homebase
  processedIds.unshift('feed');
}

return processedIds;
```

### Feed Management in Interface

```typescript
// Feed doesn't appear in drag-and-drop interface
// It's managed automatically by the system
const draggableFidgets = miniApps.filter(app => app.id !== 'feed');
```

## Performance and Optimizations

### Change Debouncing

```typescript
// Avoid multiple save operations
const debouncedSave = useMemo(
  () => debounce(saveLayoutDetails, 300),
  [saveLayoutDetails]
);
```

### Ordering Memoization

```typescript
// Cache ordering to avoid recalculations
const sortedFidgetIds = useMemo(() => {
  return getSortedFidgetIds(fidgetInstanceDatums, mobileLayout);
}, [fidgetInstanceDatums, mobileLayout]);
```

### Optimized Reconciliation

```typescript
// Unique keys for React reconciliation
<Draggable 
  key={`miniapp-${miniApp.id}`}  // Avoids unnecessary re-renders
  draggableId={miniApp.id}
  index={index}
/>
```

## Debugging and Troubleshooting

### Useful Logs

```typescript
// Debug ordering
console.log('🔄 Fidget order before sort:', Object.keys(fidgetInstanceDatums));
console.log('🔄 Mobile layout order:', mobileLayout?.fidgetOrder);
console.log('🔄 Final sorted order:', sortedFidgetIds);
```

### Common Issues

1. **Drag doesn't work**: Check if callback is being called
2. **Order doesn't persist**: Check if save is being executed
3. **Incorrect order**: Check if Space.tsx is applying ordering
4. **Poor performance**: Check for excessive re-renders

### Order Validation

```typescript
const validateFidgetOrder = (order: string[], datums: Record<string, any>) => {
  // Check if all IDs exist
  const validIds = order.filter(id => datums[id]);
  
  // Check if there are missing IDs
  const allIds = Object.keys(datums);
  const missingIds = allIds.filter(id => !order.includes(id));
  
  return {
    valid: validIds.length === order.length && missingIds.length === 0,
    validIds,
    missingIds
  };
};
```

## Testing

### Test Scenarios

1. **Basic drag**: Move fidget from one position to another
2. **Persistence**: Reload page and verify order
3. **Edge cases**: Drag to invalid positions
4. **Performance**: Multiple consecutive drags
5. **Feed**: Verify feed doesn't interfere with drag

### Mock for Tests

```typescript
const mockDragResult: DropResult = {
  draggableId: 'fidget1',
  type: 'DEFAULT',
  source: { droppableId: 'mobile-fidgets', index: 0 },
  destination: { droppableId: 'mobile-fidgets', index: 2 },
  mode: 'FLUID',
  reason: 'DROP'
};
```

## Extensibility

### Future Improvements

1. **Drag between categories**: Allow moving fidgets between groups
2. **Mobile gestures**: Support for swipe to reorder
3. **Animations**: Smooth transitions during drag
4. **Undo/Redo**: Revert order changes
5. **Bulk operations**: Move multiple fidgets simultaneously

### API for Extensions

```typescript
interface DragAndDropAPI {
  reorderFidgets: (newOrder: string[]) => void;
  insertFidget: (fidgetId: string, position: number) => void;
  removeFidget: (fidgetId: string) => void;
  getFidgetOrder: () => string[];
}
```
