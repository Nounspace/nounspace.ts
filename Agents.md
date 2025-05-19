# Nounspace Codex Instructions

## Codex Guidelines
- Follow the directory and component patterns described below.
- Write strict TypeScript with clear interfaces and avoid `any`.
- After making changes, run `npm run lint` and `npm run check-types`. If these commands fail due to missing dependencies, note the failure in your summary.
- Keep commit messages concise and descriptive.

## Project Overview
Nounspace is a highly customizable [Farcaster](https://farcaster.xyz/) client, initially funded by a grant from [Nouns DAO](https://nouns.wtf/). The application allows users to customize their profile space and personal feed with Themes, Tabs, and mini-applications called Fidgets.

## Technology Stack
- **Frontend**: Next.js, TypeScript, React, Tailwind CSS
- **State Management**: Zustand with mutative middleware
- **Data Fetching**: React Query, Axios
- **Authentication**: Privy, custom identity management
- **Backend**: Supabase (PostgreSQL, Storage)
- **Blockchain Integration**: Wagmi, Viem, Ethers.js

## Architecture & Design Patterns

### 1. Component Structure (Atomic Design)
Follow the Atomic Design Pattern with components organized as:
- **Atoms**: Basic building blocks (buttons, inputs, badges)
- **Molecules**: Simple component combinations
- **Organisms**: Complex UI sections
- **Templates**: Page layouts
- **Pages**: Complete screens

### 2. Directory Structure
- `/src/app`: Next.js App Router components and routes
- `/src/authenticators`: Authentication system components
- `/src/common`: Shared code, components, and utilities
  - `/components`: UI components following atomic design
  - `/data`: State management, API clients, database connections
  - `/lib`: Utility functions and helpers
  - `/providers`: React context providers
- `/src/constants`: Application-wide constants and configurations
- `/src/fidgets`: Mini-applications that can be added to spaces
- `/src/styles`: Global CSS and styling utilities
- `/public`: Static assets

### 3. State Management (Zustand)
- Use Zustand stores with mutative middleware for complex state
- Follow the established pattern in `/src/common/data/stores/`
- Each store should be structured as:
  - Define state interfaces (`StoreState`, `StoreActions`)
  - Create default state values
  - Implement store functions with appropriate actions
  - Export store with proper partializing for persistence

Example:
```typescript
export const createStoreNameFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): StoreType => ({
  ...storeDefaults,
  actionName: (params) => {
    set((draft) => {
      draft.storeName.property = newValue;
    }, "actionName");
  },
});
```

### 4. Data Fetching
- Use React Query for remote data fetching
- Implement custom hooks for reusable data fetching
- Follow established patterns in `/src/common/lib/hooks/`
- Handle loading, error, and success states

### 5. TypeScript Standards
- Always use strict type definitions
- Avoid `any` types whenever possible
- Define interfaces and types in appropriate files
- Use generics for reusable components and functions
- Ensure proper typing for Zustand stores and API responses

### 6. Styling Approach
- Use Tailwind CSS for component styling
- Follow the `mergeClasses` pattern for conditional class names
- Use design tokens from the theme system
- Prefer component-scoped styles over global styles

### 7. Fidgets Development
- Each fidget should be self-contained in `/src/fidgets/{category}/{name}`
- Implement the FidgetModule interface
- Include settings, data management, and UI components
- Follow the established patterns for settings, styles, and data handling
- Test with different themes and screen sizes

### 8. Authentication Flow
- Authentication uses Privy with custom identity management
- Follow the setup steps defined in `LoggedInStateProvider`
- Respect the `SetupStep` enum for tracking authentication state
- Use authenticator manager for platform-specific authentication

### 9. API & Backend
- Use Supabase for database operations
- Implement API routes in `/src/pages/api/`
- Follow established patterns for error handling and response formatting
- Use strong types for API requests and responses

### 10. Error Handling
- Implement proper error boundaries
- Use try/catch for async operations
- Log meaningful error messages
- Provide user-friendly error feedback
- Avoid silent failures

### 11. Performance Considerations
- Memoize expensive computations (useMemo, useCallback)
- Optimize rendering with proper component splitting
- Use Next.js built-in optimizations for images and fonts
- Implement virtualization for long lists
- Avoid excessive re-renders with careful state management

### 12. Accessibility
- Ensure ARIA attributes are properly used
- Support keyboard navigation
- Maintain sufficient color contrast
- Test with screen readers
- Follow WAI-ARIA best practices

### 13. Testing
- Write unit tests for critical functionality
- Implement integration tests for complex flows
- Use React Testing Library for component tests
- Mock external dependencies appropriately

## Code Patterns & Best Practices

### React Import Pattern
Always include the React import at the top of your React files, even when using JSX transform:

```typescript
import React from "react";

// Other imports...
```

This ensures consistency across the codebase and maintains compatibility with all React versions and tooling configurations.

### Async/Await Pattern
Always use async/await for asynchronous operations:

```typescript
async function fetchData() {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
```

### Component Structure
```typescript
import React from "react";
import { someUtility } from "@/common/lib/utils";

interface ComponentProps {
  prop1: string;
  prop2: number;
  onAction: () => void;
}

export const ComponentName: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2, 
  onAction 
}) => {
  // Component logic here
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### Hook Pattern
```typescript
import { useState, useEffect } from "react";

export function useCustomHook(params: HookParams): HookResult {
  const [state, setState] = useState<StateType>(initialState);
  
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup logic
    };
  }, [dependencies]);
  
  // Hook functions
  
  return {
    // Return values
  };
}
```

### Store Pattern
```typescript
interface StoreState {
  // State properties
}

interface StoreActions {
  // Action methods
}

export type StoreType = StoreState & StoreActions;

export const storeDefaults: StoreState = {
  // Default values
};

export const createStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): StoreType => ({
  ...storeDefaults,
  // Implement actions
});
```

## Development Workflow
1. **Perform Comprehensive Code Research**
   - Before implementing any feature, thoroughly explore the codebase to understand existing patterns
   - Use semantic search to find similar components, utilities, or implementations
   - Review related files to understand data flow and component interactions
   - Identify reusable code, hooks, or utilities to avoid duplication
   - Study the project structure to ensure new code fits the established architecture
   - Understand the context of the task within the larger system

2. Understand the feature requirements thoroughly
3. Plan the implementation approach, considering the existing architecture
4. Implement the feature following the established patterns
5. Test thoroughly across different environments and conditions
6. Document any new patterns or approaches
7. Seek code review before merging

## Code Research Best Practices
- Always examine similar components or features before creating new ones
- Look for established patterns in state management, component structure, and API interactions
- Check for existing utilities or hooks that might solve your problem
- Review tests for similar components to understand expected behavior
- Consider performance implications and how new code fits into the existing architecture
- Document insights gained from research to inform implementation decisions

## Common Pitfalls & Gotchas
1. Ensure proper state handling in Zustand stores with mutative
2. Be cautious with blockchain interactions - always test thoroughly
3. Handle authentication state transitions properly
4. Consider performance implications when working with large data sets
5. Ensure proper cleanup in useEffect hooks
6. Be aware of TypeScript nuances, especially with complex types
7. Watch for proper error handling in async operations
8. Maintain consistent naming conventions across the codebase
