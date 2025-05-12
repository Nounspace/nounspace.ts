
# Task List: Refactor Space Layout & Mobile Navbar

## Context
The goal is to implement a unified design pattern for desktop (grid) and mobile (fullscreen/tab) layouts, and to create a better, more accessible and maintainable mobile navbar for spaces.

## Objectives
- Standardize layout handling by abstracting desktop and mobile views
- Build a reusable, responsive mobile navbar component
- Improve code organization and clarity in `Space.tsx` and layout fidget modules
- Ensure accessibility and performance

## Phases & Tasks

### 1. Research & Exploration
- [x] Review `Space.tsx` and existing `LayoutFidgets` in `/src/fidgets/layout/`
  - [x] Identify duplication between Grid and TabFullScreen implementations
  - [x] Map out props and behaviors shared by both layouts
  - [x] Note existing mobile hooks (`useIsMobile`, `MOBILE_PADDING`, etc.)
- [x] Audit current mobile UI in browser/dev tools (responsive modes)
- [x] Identify Tailwind classes and design tokens needed for new navbar

### 2. Design Mobile Navbar Component
- [x] Define interface for `MobileNavbar` in `/src/common/components/organisms/MobileNavbar.tsx`
  - Props: `tabs: TabItem[]`, `selected: string`, `onSelect: (id: string) => void`, `theme: UserTheme`
- [x] Sketch responsive behaviors: fixed bottom, icon + label, overflow scrolling
- [x] Create story or visual spec for `MobileNavbar`

### 3. Implement MobileNavbar
- [x] Create `/src/common/components/organisms/MobileNavbar.tsx`
  - [x] Render a scrollable tab list with Tailwind utilities
  - [x] Highlight selected tab via theme tokens
  - [x] Apply ARIA roles (`tablist`, `tab`)
  - [x] Support dynamic tab labels and icons (use `tabNames` from `SpaceConfig.tabNames`)

### 4. Refactor `Space.tsx`
- [x] Import and integrate `MobileNavbar` when `isMobile === true`
  - Replace `TabNavigation` and gradient overlay
  - Pass `layoutConfig.layout` or processed fidget IDs as `tabs`
- [x] Encapsulate layout selection and props injection
  - Move mobile-specific logic out of the main render tree
  - Simplify `Space.tsx` by delegating to `MobileView` and `DesktopView` subcomponents
- [x] Update `layoutFidgetProps` to include necessary callbacks for navbar

### 5. Unify LayoutFidget Patterns
- [x] Extract common hook `useProcessedFidgetIds` for both Grid and Tab layouts
- [x] Move layoutConfig derivation into shared utility `/src/common/utils/layoutUtils.ts`
- [x] Simplify `LayoutFidget` modules to consume new hooks and `MobileNavbar`

### 6. Styling & Theming
- [x] Ensure `MobileNavbar` uses `mergeClasses` pattern for conditional classes
- [x] Use design tokens from `/src/constants/themes.ts`

### 7. Accessibility
- [x] Verify `MobileNavbar` tablist meets WAI-ARIA guidelines
- [x] Ensure keyboard navigation (arrow keys, focus management)

### 8. Performance & Optimization
- [x] Memoize tab list items with `React.memo`
- [x] Use `useCallback` for event handlers
- [x] Benchmark mount/render times before/after

### 9. Validation
- [x] Manual testing of mobile and desktop views
- [x] Verify tab switching works correctly
- [x] Check configuration saving

### 10. Documentation & Cleanup
- [x] Document `MobileNavbar` API in `/docs/components.md`
- [x] Create comprehensive JSDoc comments with TypeScript interfaces
- [x] Add React component usage examples with code snippets
- [x] Document theming API and customization options
- [x] Remove deprecated gradient overlay code from `Space.tsx`
- [x] Clean up unused imports and props


### 11. App Navigation Bar
- [x] Design and implement a top-level AppNavbar component in `/src/common/components/organisms/AppNavbar.tsx`
  - Use navigation items from the app sidebar for consistency
  - Place the navigation bar at the top of the app, above main content
  - Layout:
    - If user is **not logged in**: `[ sidebar open icon {space} icon_logo {space} sign in button ]`
    - If user **is logged in**: `[ user icon to open sidebar {space} icon_logo {space} write new cast button (icon only) ]`
  - Integrate with authentication (Privy) to determine login state
  - Ensure accessibility (ARIA roles, keyboard navigation)
  - Use theme tokens and Tailwind CSS for styling, following the `mergeClasses` pattern
  - Memoize navigation items and handlers for performance
  - Update documentation and usage examples in `/docs/components.md`
  - Add unit and integration tests for navigation bar behaviors

## Milestones
- [x] Phase 1 complete: research and specs approved
- [x] Phase 2 complete: `MobileNavbar` component implemented
- [x] Phase 3 complete: refactor `Space.tsx` with new views
- [x] Phase 4 complete: unified layout patterns and utilities
- [x] Phase 5 complete: AppNavbar implemented and integrated
- [x] Final review and merge
