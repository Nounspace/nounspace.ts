# Multiple Layouts System

## Overview

This document explains the multiple layouts system implemented in Nounspace, which enables different layout configurations for desktop and mobile, including automatic migration of old layouts.

## System Architecture

### Separation of Concerns (SoC)

The system was designed following the Separation of Responsibilities principle:

```text
Space.tsx (Controller)
    ↓
[DesktopView | MobileViewSimplified | MobilePreview]
    ↓
LayoutFidgets (Rendering)
```

### Main Components

1. **Space.tsx** - Controller component that:
   - Determines which layout to show
   - Manages configuration data
   - Migrates old layouts when necessary

2. **LayoutFidgetDetails** - Extended interface that supports:
   - Desktop configuration (backward compatibility)
   - Mobile layout configurations
   - Automatic migration system

3. **MobileViewSimplified** - Mobile layout component that:
   - Renders fidgets based on mobile order
   - Supports automatic feed injection in homebase
   - Uses existing layout system

## Layout Decision Flow

### 1. Space Loading

```typescript
// In Space.tsx
const layoutDetails = config.layoutDetails;

// Check if it has multiple layouts configuration
if (!layoutDetails.layouts) {
  // Automatically migrate to new system
  layoutDetails.layouts = {
    mobile: generateInitialMobileLayout(fidgetInstanceDatums)
  };
}
```

### 2. Layout Selection

```typescript
// Space.tsx determines which layout to use
const isMobile = useIsMobile();
const isPreview = useIsPreview();

if (isPreview && isMobile) {
  return <MobilePreview />;
} else if (isMobile) {
  return <MobileViewSimplified />;
} else {
  return <DesktopView />;
}
```

### 3. Layout Rendering

```typescript
// Each layout component receives only necessary data
<MobileViewSimplified
  fidgetInstanceDatums={fidgetInstanceDatums}
  mobileLayout={layoutDetails.layouts.mobile}
  isHomebasePath={pathname === '/homebase'}
/>
```

## Migration System

### Old Layout Detection

The system automatically detects if a space is using the old system:

```typescript
// Check if layouts configuration doesn't exist
if (!layoutDetails.layouts) {
  // This is an old layout, needs to be migrated
}
```

### Migration Process

1. **Detection**: Space.tsx checks if `layoutDetails.layouts` exists
2. **Generation**: Creates initial configuration based on existing fidgets
3. **Preservation**: Maintains all existing desktop configurations
4. **Update**: Saves the new extended configuration

```typescript
const migrateToMultipleLayouts = (layoutDetails: LayoutFidgetDetails) => {
  return {
    ...layoutDetails,
    layouts: {
      mobile: {
        fidgetOrder: Object.keys(fidgetInstanceDatums),
        feedEnabled: pathname === '/homebase'
      }
    }
  };
};
```

## Code Transition Points

### Where Old Layouts May Still Exist

1. **Initial Loading**: Until first check in Space.tsx
2. **During SSR**: On server, before hydration
3. **Cache**: In cached data that hasn't been migrated yet

### Where Layouts Have Been Migrated

1. **After Space.tsx**: All child components receive migrated data
2. **Saving**: New data is always saved in current format
3. **Props**: Layout components receive structured data

## Mobile Layout Configuration

### Data Structure

```typescript
interface MobileLayout {
  fidgetOrder: string[];           // Fidget order
  feedEnabled: boolean;            // Whether feed should be injected
  feedPosition?: 'start' | 'end';  // Feed position (default: start)
}

interface LayoutFidgetDetails {
  // ... existing settings (compatibility)
  layouts?: {
    mobile: MobileLayout;
    // Future expansions: tablet, tv, etc.
  };
}
```

### Feed Injection

The feed is automatically injected only in homebase:

```typescript
// In MobileViewSimplified
const shouldShowFeed = isHomebasePath && mobileLayout.feedEnabled;

if (shouldShowFeed) {
  // Add feed at specified position
  const feedFidget = createFeedFidget();
  fidgets = injectFeed(fidgets, feedFidget, mobileLayout.feedPosition);
}
```

## Mobile Drag-and-Drop

### Ordering System

1. **Interface**: MobileSettings.tsx allows dragging fidgets
2. **Callback**: Calls ThemeSettingsEditor with new order
3. **Saving**: Updates `layouts.mobile.fidgetOrder`
4. **Rendering**: Space.tsx applies new order automatically

### Data Flow

```text
User drags fidget → MobileSettings → ThemeSettingsEditor → 
layoutDetails.layouts.mobile.fidgetOrder → Space.tsx → 
MobileViewSimplified → New order rendered
```

## Performance Considerations

### Efficient Migration

- Migration happens only once per space
- No redundant checks after migration
- Data is saved in current format

### Optimized Rendering

- Components receive only necessary data
- No layout logic in rendering components
- Cache fidget ordering when possible

## Future Extensibility

### New Layout Types

```typescript
interface LayoutFidgetDetails {
  layouts?: {
    mobile: MobileLayout;
    tablet?: TabletLayout;    // Future
    desktop?: DesktopLayout;  // Future
    tv?: TVLayout;           // Future
  };
}
```

### New Mobile Features

- Support for multiple pages/tabs
- Per-fidget configurations (hide/show)
- Device-specific themes
- Custom animations

## Troubleshooting

### Common Issues

1. **Layout doesn't migrate**: Check if Space.tsx is being rendered
2. **Feed doesn't appear**: Confirm `isHomebasePath` is correct
3. **Order doesn't save**: Check drag-and-drop callback
4. **Performance**: Check if migration is happening multiple times

### Debug

```typescript
// Add logs for debugging
console.log('Layout before migration:', layoutDetails);
console.log('Layout after migration:', migratedLayout);
console.log('Fidget order:', mobileLayout.fidgetOrder);
```
