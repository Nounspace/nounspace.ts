# Fidget System Overview

Fidgets are mini-applications that can be added to spaces to provide specific functionality. The fidget system is built on a modular architecture with support for different types of fidgets, configuration management, and layout integration.

## Core Concepts

### Fidget Types

1. **UI Fidgets** - Basic UI components (text, gallery, iframe, etc.)
2. **Farcaster Fidgets** - Farcaster protocol integration (casts, feeds, frames)
3. **Community Fidgets** - Community-specific functionality (governance, snapshot)
4. **Layout Fidgets** - Layout management (grid, mobile stack)
5. **Token Fidgets** - Token and portfolio management
6. **Custom Fidgets** - User-created fidgets

### Fidget Architecture

Fidgets are structured using three main types:

- **FidgetInstanceData**: Contains the fidget's unique ID, type identifier, and configuration. Each fidget instance has a unique ID generated when created.

- **FidgetConfig**: The core configuration object containing:
  - `editable`: Boolean flag indicating if the fidget can be edited
  - `data`: Runtime state and cached data that persists to the database
  - `settings`: User-configurable settings that control the fidget's behavior

- **FidgetBundle**: Combines a fidget instance with its properties metadata, providing everything needed to render the fidget.

## Fidget System Components

### 1. Fidget Registry

The `CompleteFidgets` registry contains all available fidgets organized by category:

- **UI Fidgets**: Basic UI components including gallery, text, iframe, links, video, channel, and profile
- **Farcaster Fidgets**: Protocol integration fidgets for frames, feeds, casts, and builder scores
- **Community Fidgets**: Community-specific functionality like governance, snapshot, and nouns home
- **Token Fidgets**: Token and portfolio management including market data, portfolio tracking, swap functionality, and directory listings
- **Other Fidgets**: Additional utilities like RSS feeds, chat, and frames v2
- **Development Fidgets**: Example fidgets available only in development environments

### 2. Fidget Properties

Each fidget defines its properties and configuration through a `FidgetProperties` object that includes:
- The fidget's display name and description
- An array of configurable fields that define the settings UI
- Category and tags for organization and discovery
- Version information for tracking changes

### 3. Fidget Instance Management

Fidget instances are created using a generator function that:
- Takes a fidget type identifier and the fidget module
- Optionally accepts custom settings to override defaults
- Merges base settings from the fidget's field definitions with any custom settings
- Generates a unique ID by combining the fidget type with a UUID
- Initializes the configuration with editable set to true and empty data object

## Fidget Lifecycle

### 1. Creation

When creating a new fidget, the system:
- Generates a fidget instance with the specified type and settings
- Adds the instance to the current space's tab configuration
- Saves the configuration to the server for persistence
- Assigns a position in the layout

### 2. Configuration

Fidget settings can be updated at any time:
- The current configuration is retrieved from the store
- Settings are updated optimistically in the local state
- Changes are synchronized with the server
- The fidget re-renders with the new configuration

### 3. Rendering

When rendering a fidget:
- The fidget module is looked up from the registry by type
- A bundle is created combining the instance data with properties
- The fidget component receives the configuration, properties, theme, and callback functions
- Rendering is handled by the fidget's own component implementation

## Layout Integration

### 1. Grid Layout

The grid layout displays fidgets in a flexible grid system:
- All fidget instances in the current tab are converted to bundles
- Bundles are memoized for performance
- Each bundle is rendered in its assigned grid position
- The layout supports drag-and-drop repositioning

### 2. Mobile Stack Layout

The mobile stack layout provides a vertical scrolling experience:
- Only fidgets valid for mobile are included
- Fidgets are stacked vertically in order
- An optional feed section can be included at the top
- Bundles are created with editable set to false for mobile viewing

## Fidget Development

### 1. Creating a Fidget

A fidget consists of two main parts:
- **Component**: A React component that receives configuration, properties, theme, and callback functions. It manages its own local state for settings and renders the fidget UI. When editable, it can display a settings editor and remove button.
- **Properties**: Metadata defining the fidget's name, description, configurable fields, category, tags, and version. Fields define what settings are available and how they're displayed in the settings editor.

### 2. Fidget Settings

Settings are stored as a key-value record where keys correspond to field names. Each field definition specifies:
- The field name used as the key in settings
- The data type (string, number, boolean, select, or color)
- A default value
- A display label
- Optional options for select fields
- Optional validation function

### 3. Fidget Validation

Settings are validated by checking each field defined in properties:
- If a field has a validation function, it's used to check the value
- Otherwise, the system checks that the value is defined
- All fields must pass validation for the settings to be considered valid

### 4. Fidget Data Field

The `config.data` field in `FidgetConfig` is used to store runtime state and cached data. **Important: This field is persisted to the database**, making it suitable for:

- Cached API responses
- Runtime state that should survive page reloads
- Metadata about the last data fetch
- Any data that needs to persist across sessions

**Key Points:**
- `config.data` is persisted to the database and stored in the Zustand store
- **Use `data` prop directly** - no local state needed (store is single source of truth)
- Use `saveData` prop passed to fidgets to update data
- Always provide defaults when reading: `data?.field ?? defaultValue`
- Store updates trigger automatic re-renders - no manual sync needed
- Use change detection before persisting to avoid unnecessary writes

**Data Flow:**
```
Zustand Store → data prop → Component reads directly
Component calls saveData() → Store updates immediately → Component re-renders automatically
Later: commitConfig() → Database (persistent storage)
```

**Best Practices:**
See [Data Field Patterns](DATA_FIELD_PATTERNS.md) for comprehensive patterns and examples including:
- Using data prop directly (no local state)
- Change detection before persistence
- Refresh detection with React dependencies
- Staleness detection
- Error handling
- And more...

### 5. FidgetWrapper

The `FidgetWrapper` component provides common functionality for all fidgets:

**Features:**
- **Settings Backfill**: Automatically populates empty settings from `lastFetchSettings` stored in `config.data`
- **Stable `saveData`**: Provides a memoized `saveData` function to prevent unnecessary re-renders
- **Settings Editor**: Integrates with `FidgetSettingsEditor` for configuration UI
- **Error Handling**: Wraps fidgets with error boundaries

**Settings Backfill Pattern:**
Any fidget can use the `lastFetchSettings` pattern to automatically backfill empty settings when created from external sources. When your fidget fetches data, store a snapshot of the settings used for that fetch in `config.data.lastFetchSettings`. The FidgetWrapper will automatically detect empty settings and populate them from this snapshot, ensuring fidgets created programmatically (e.g., from URL parameters) have their settings properly configured.

See [Settings Backfill System](SETTINGS_BACKFILL.md) for detailed documentation.

## Performance Considerations

### 1. Lazy Loading

Fidget components can be lazy-loaded to reduce initial bundle size. Components are loaded on-demand when needed, with a loading fallback displayed during the import.

### 2. Memoization

Fidget bundles are memoized to prevent unnecessary re-computation. Bundles are recalculated only when the underlying fidget instance data or editability changes.

### 3. Bundle Optimization

Bundle creation includes validation checks to ensure the fidget module exists before creating the bundle. This prevents errors from invalid fidget types and optimizes the bundle creation process.

## Error Handling

### 1. Fidget Errors

Fidgets are wrapped in error boundaries to prevent a single fidget error from crashing the entire space. When an error occurs, a fallback UI is displayed and the error is logged for debugging. Errors can also be reported to analytics systems for monitoring.

### 2. Missing Fidgets

The system handles missing or invalid fidgets gracefully:
- Fidget IDs from layouts are validated against available instances
- Missing fidget modules are filtered out
- Mobile compatibility is checked before including fidgets in mobile layouts
- Only valid, available fidgets are rendered

## Testing

### 1. Unit Tests

Unit tests verify individual fidget functionality:
- Fidget instance creation with correct type and settings
- Settings validation and default value application
- Property definitions and field configurations

### 2. Integration Tests

Integration tests verify fidget behavior in context:
- Fidget rendering within layouts
- Settings editor functionality
- Save and remove operations
- Interaction with the fidget wrapper

## Troubleshooting

### Common Issues

1. **Fidget Not Loading**: Check fidget type and module availability
2. **Settings Not Saving**: Verify fidget configuration and permissions
3. **Layout Issues**: Check fidget compatibility with layout type
4. **Performance Issues**: Implement lazy loading and memoization

### Debug Tools

- Use React DevTools to inspect fidget state
- Check browser console for fidget errors
- Verify fidget configuration and properties
- Test fidget rendering in isolation

## Future Considerations

- Enhanced fidget discovery
- Advanced configuration options
- Fidget marketplace
- Performance monitoring
