
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
- [ ] Create `/src/common/components/organisms/MobileNavbar.tsx`
  - [ ] Render a scrollable tab list with Tailwind utilities
  - [ ] Highlight selected tab via theme tokens
  - [ ] Apply ARIA roles (`tablist`, `tab`)
  - [ ] Support dynamic tab labels and icons (use `tabNames` from `SpaceConfig.tabNames`)

### 4. Refactor `Space.tsx`
- [ ] Import and integrate `MobileNavbar` when `isMobile === true`
  - Replace `TabNavigation` and gradient overlay
  - Pass `layoutConfig.layout` or processed fidget IDs as `tabs`
- [ ] Encapsulate layout selection and props injection
  - Move mobile-specific logic out of the main render tree
  - Simplify `Space.tsx` by delegating to `MobileView` and `DesktopView` subcomponents
- [ ] Update `layoutFidgetProps` to include necessary callbacks for navbar

### 5. Unify LayoutFidget Patterns
- [ ] Extract common hook `useProcessedFidgetIds` for both Grid and Tab layouts
- [ ] Move layoutConfig derivation into shared utility `/src/common/utils/layoutUtils.ts`
- [ ] Simplify `LayoutFidget` modules to consume new hooks and `MobileNavbar`

### 6. Styling & Theming
- [ ] Ensure `MobileNavbar` uses `mergeClasses` pattern for conditional classes
- [ ] Use design tokens from `/src/constants/themes.ts`

### 7. Accessibility
- [ ] Verify `MobileNavbar` tablist meets WAI-ARIA guidelines
- [ ] Ensure keyboard navigation (arrow keys, focus management)

### 8. Performance & Optimization
- [ ] Memoize tab list items with `React.memo`
- [ ] Use `useCallback` for event handlers
- [ ] Benchmark mount/render times before/after

### 9. Validation
- [ ] Manual testing of mobile and desktop views
- [ ] Verify tab switching works correctly
- [ ] Check configuration saving

### 10. Documentation & Cleanup
- [ ] Document `MobileNavbar` API in `/docs/components.md`
- [ ] Create comprehensive JSDoc comments with TypeScript interfaces
- [ ] Add React component usage examples with code snippets
- [ ] Document theming API and customization options
- [ ] Remove deprecated gradient overlay code from `Space.tsx`
- [ ] Clean up unused imports and props

## Milestones
- [x] Phase 1 complete: research and specs approved
- [x] Phase 2 complete: `MobileNavbar` component implemented
- [ ] Phase 3 complete: refactor `Space.tsx` with new views
- [ ] Phase 4 complete: unified layout patterns and utilities
- [ ] Final review and merge
