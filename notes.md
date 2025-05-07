# Nounspace Layout & Mobile Navbar Refactor

## Phase 1: Research & Exploration Findings

### Current Implementation Analysis

#### Space.tsx Component
- Serves as the main container for all space content
- Conditionally renders different layout components based on device type using `useIsMobile()`
- Contains logic to transform fidget data differently for mobile vs desktop
- Has mobile-specific UI elements like gradient overlays for tabs
- Memoizes props and layouts to prevent unnecessary re-renders

#### LayoutFidget Components
1. **Grid.tsx (Desktop)**
   - Uses react-grid-layout for draggable/resizable fidgets
   - Supports edit mode with advanced layout capabilities
   - Complex grid sizing and positioning logic

2. **TabFullScreen (Mobile)**
   - Uses a tabbed interface where each tab is a fidget
   - Built on Radix UI tabs component
   - Contains special handling for consolidated media and pinned fidgets
   - Has a fixed bottom tab navigation

#### Current Mobile Navigation
- `TabNavigation.tsx` renders a scrollable list of tabs at the bottom of the screen
- Contains complex scroll state management with gradient overlays
- Custom icon handling for different fidget types
- Lacks some accessibility features and modern mobile UI patterns

### Duplication & Patterns Identified

1. **Fidget Processing Logic**: Similar code for processing fidget IDs appears in both Space.tsx and TabFullScreen
2. **Mobile-specific UI**: Mobile styling and behavior scattered across components
3. **Tab Management**: Tab selection logic exists in multiple places
4. **Gradient Overlays**: Similar gradient overlay pattern used in different components

### Mobile-specific Resources
- `useIsMobile()` hook detects viewport width < 768px
- `MOBILE_PADDING` constant (12px) for consistent spacing
- `TAB_HEIGHT` constant (72px) for fixed tab height

### UI & Styling Patterns
- Radix UI provides base component infrastructure
- `mergeClasses` utility (clsx + tailwind-merge) for conditional class names
- Theme system with customizable properties for backgrounds, borders, etc.

### Accessibility Considerations
- Current implementation could be improved with better ARIA roles
- Keyboard navigation support could be enhanced
- Focus management needs improvement for tab switching

### Recommended Approach

1. **Create unified hooks and utilities:**
   - `useProcessedFidgetIds` to centralize fidget processing logic
   - Move common layout functions to `/src/common/utils/layoutUtils.ts`

2. **Build a reusable MobileNavbar component:**
   - Place in `/src/common/components/organisms/MobileNavbar.tsx`
   - Use proper ARIA roles and keyboard navigation
   - Support theme customization and dynamic content
   - Replace the current TabNavigation component

3. **Refactor Space.tsx:**
   - Create MobileView and DesktopView subcomponents
   - Remove mobile-specific logic from the main render tree
   - Simplify props and callbacks

4. **Unify layout patterns:**
   - Create consistent interface between Grid and TabFullScreen layouts
   - Standardize how layouts consume and save configurations

## Phase 2: MobileNavbar Implementation

### Summary
Phase 2 focused on designing and implementing the `MobileNavbar` component to enhance mobile navigation. This component introduces a responsive, accessible, and theme-integrated navigation bar for mobile users.

### Key Features
- **Scrollable Tab List**: The `MobileNavbar` renders a scrollable list of tabs, ensuring a smooth user experience even with a large number of tabs.
- **Gradient Overlays**: Added gradient overlays to improve the visual distinction of scrollable content.
- **Accessibility Enhancements**: Implemented ARIA roles (`tablist`, `tab`) and keyboard navigation support for better accessibility.
- **Dynamic Content Support**: The component dynamically renders tab labels and icons based on `SpaceConfig.tabNames`.
- **Theme Integration**: Utilized design tokens to ensure seamless integration with the application's theme system.

### Implementation Details
- The `MobileNavbar` component was created in `/src/common/components/organisms/MobileNavbar.tsx`.
- Tailwind CSS utilities were used for styling, following the `mergeClasses` pattern for conditional class names.
- The component interface includes:
  - `tabs: TabItem[]`: Array of tab items to render.
  - `selected: string`: ID of the currently selected tab.
  - `onSelect: (id: string) => void`: Callback for handling tab selection.
  - `theme: UserTheme`: Theme configuration for styling.

### Challenges & Solutions
- **Scrollable Tabs**: Ensured smooth scrolling behavior by leveraging Tailwind utilities and testing across devices.
- **Accessibility**: Addressed ARIA compliance and keyboard navigation by consulting WAI-ARIA guidelines.
- **Dynamic Content**: Integrated `SpaceConfig.tabNames` to support dynamic tab labels and icons.

### Next Steps
- Integrate the `MobileNavbar` into `Space.tsx` for mobile views.
- Replace the existing `TabNavigation` component and remove deprecated gradient overlay code.
- Validate the component's performance and accessibility through testing.

### Status
Phase 2 is complete, and the `MobileNavbar` component is ready for integration and further validation in Phase 3.
