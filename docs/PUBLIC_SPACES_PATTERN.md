# Public Spaces Pattern

This document describes the architectural pattern used for public spaces in Nounspace, including how different space types are structured and how common functionality is shared.

## Overview

The public spaces pattern follows a clear separation of concerns between type-specific logic and common functionality. This ensures consistency across different space types while maintaining clean, maintainable code.

## Architecture

### Core Components

1. **Page Components** - Server-side data loading and routing
2. **Space Components** - Type-specific logic and configuration
3. **PublicSpace** - Common functionality shared across all space types

### Data Flow

```
Server-side data loading (Page Component)
    ↓
Type-specific space creation (Space Component)
    ↓
Common space management (PublicSpace)
    ↓
Space rendering and interaction
```

## Space Types

### 1. Profile Spaces (`/s/[handle]`)

**Purpose**: User profile spaces for Farcaster users

**Components**:
- `src/app/(spaces)/s/[handle]/page.tsx` - Page component
- `src/app/(spaces)/s/[handle]/ProfileSpace.tsx` - Space component

**Data Flow**:
```typescript
// Page Component - Server-side data loading
export default async function ProfileSpacePage({ params }) {
  const { spaceOwnerFid, spaceOwnerUsername, spaceId, tabName } = 
    await loadUserSpaceData(handle, tabNameParam);
  
  return (
    <ProfileSpace
      spaceOwnerFid={spaceOwnerFid}
      spaceOwnerUsername={spaceOwnerUsername}
      spaceId={spaceId}
      tabName={tabName}
    />
  );
}

// Space Component - Type-specific logic
export const ProfileSpace = ({ spaceOwnerFid, spaceOwnerUsername, spaceId, tabName }) => {
  const profileSpaceData: ProfileSpaceData = {
    id: spaceId || undefined, // Will be set by PublicSpace
    spaceName: spaceOwnerUsername || "Profile",
    spaceType: SPACE_TYPES.PROFILE,
    fid: spaceOwnerFid,
    spacePageUrl: getSpacePageUrl,
    isEditable: checkProfileSpaceEditability,
    config: INITIAL_PERSONAL_SPACE_CONFIG
  };
  
  return <PublicSpace spaceData={profileSpaceData} tabName={tabName} />;
};
```

### 2. Token Spaces (`/t/[network]/[contractAddress]`)

**Purpose**: Token/contract spaces for ERC-20 tokens and NFTs

**Components**:
- `src/app/(spaces)/t/[network]/[contractAddress]/page.tsx` - Page component
- `src/app/(spaces)/t/[network]/TokenSpace.tsx` - Space component

**Data Flow**:
```typescript
// Page Component - Server-side data loading
export default async function ContractPrimarySpace({ params }) {
  const tokenData = await loadTokenData(contractAddress, network);
  
  return (
    <TokenSpace
      spaceId={spaceId}
      tabName={tabName}
      contractAddress={contractAddress}
      ownerId={ownerId}
      ownerIdType={ownerIdType}
    />
  );
}

// Space Component - Type-specific logic
export default function TokenSpace({ spaceId, tabName, contractAddress, ownerId, ownerIdType }) {
  const { tokenData } = useToken(); // Uses TokenProvider context
  
  const tokenSpace: TokenSpaceData = {
    id: spaceId || `temp-token-${contractAddress}-${tokenData?.network}`,
    spaceName: tokenData?.clankerData?.symbol || contractAddress,
    spaceType: SPACE_TYPES.TOKEN,
    contractAddress: contractAddress,
    network: tokenData?.network || 'mainnet',
    ownerAddress: spaceOwnerAddress,
    tokenData: tokenData,
    spacePageUrl: getSpacePageUrl,
    isEditable: checkTokenSpaceEditability,
    config: INITIAL_SPACE_CONFIG
  };
  
  return <PublicSpace spaceData={tokenSpace} tabName={tabName} />;
};
```

### 3. Proposal Spaces (`/p/[proposalId]`)

**Purpose**: DAO proposal spaces for Nouns governance

**Components**:
- `src/app/(spaces)/p/[proposalId]/[tabname]/page.tsx` - Page component
- `src/app/(spaces)/p/[proposalId]/ProposalSpace.tsx` - Space component

**Data Flow**:
```typescript
// Page Component - Server-side data loading
export default async function WrapperProposalPrimarySpace({ params }) {
  const proposalData = await loadProposalData(proposalId);
  
  return (
    <ProposalSpace
      proposalData={proposalData}
      proposalId={proposalId}
      tabName={tabName}
    />
  );
}

// Space Component - Type-specific logic
const ProposalSpace = ({ proposalData, proposalId, tabName }) => {
  const proposalSpace: ProposalSpaceData = {
    id: undefined, // Will be set by PublicSpace through registration
    spaceName: `Proposal ${proposalId}`,
    spaceType: SPACE_TYPES.PROPOSAL,
    proposalId: proposalId,
    ownerAddress: ownerId,
    spacePageUrl: getSpacePageUrl,
    isEditable: checkProposalSpaceEditability,
    config: INITIAL_SPACE_CONFIG
  };
  
  return <PublicSpace spaceData={proposalSpace} tabName={tabName} />;
};
```

## PublicSpace Component

The `PublicSpace` component handles all common functionality shared across space types:

### Responsibilities

1. **Space Resolution**: Finds existing spaces in `localSpaces` by matching:
   - **Profile spaces**: by `fid`
   - **Token spaces**: by `contractAddress` + `network`
   - **Proposal spaces**: by `proposalId`

2. **Space Registration**: Registers new spaces if they don't exist

3. **Space State Management**: Manages `currentSpaceId` and `currentTabName`

4. **Tab Loading and Caching**: Loads and caches space tabs efficiently

5. **Editability Logic**: Calls `spaceData.isEditable()` to determine if space is editable

6. **Space Switching**: Handles switching between different spaces

7. **Loading States**: Manages loading states and error handling

### Key Features

```typescript
// Space resolution logic
if (isProposalSpace(spaceData)) {
  const existingSpace = Object.values(localSpacesSnapshot).find(
    (s) => s.proposalId === spaceData.proposalId
  );
  if (existingSpace) {
    nextSpaceId = existingSpace.id;
  }
}

// Space registration
if (!existingSpace) {
  const newSpaceId = await registerProposalSpace(proposalId, ownerAddress);
  setCurrentSpaceId(newSpaceId);
}

// Editability check
const isEditable = useMemo(() => {
  return spaceData.isEditable(currentUserFid, wallets);
}, [spaceData, currentUserFid, wallets]);
```

## Space Data Structure

Each space type implements a common `SpaceData` interface with type-specific fields:

```typescript
interface SpaceData {
  id?: string; // Set by PublicSpace through registration
  spaceName: string;
  spaceType: SPACE_TYPES;
  updatedAt: string;
  spacePageUrl: (tabName: string) => string;
  isEditable: (currentUserFid?: number, wallets?: { address: Address }[]) => boolean;
  config: SpaceConfig;
}

// Type-specific extensions
interface ProfileSpaceData extends SpaceData {
  fid: number;
}

interface TokenSpaceData extends SpaceData {
  contractAddress: Address;
  network: string;
  tokenData?: MasterToken;
}

interface ProposalSpaceData extends SpaceData {
  proposalId: string;
  ownerAddress: Address;
}
```

## Naming Conventions

The codebase follows consistent naming patterns across all space types:

### Component Naming
- **Space Components**: `{Type}Space` (e.g., `ProfileSpace`, `TokenSpace`, `ProposalSpace`)
- **Files**: `{Type}Space.tsx` (e.g., `ProfileSpace.tsx`, `TokenSpace.tsx`, `ProposalSpace.tsx`)
- **Props Interfaces**: `{Type}SpaceProps` (e.g., `ProfileSpaceProps`, `TokenSpaceProps`, `ProposalSpaceProps`)

### Space Data Types
- **Base Interface**: `SpaceData`
- **Type-specific Interfaces**: `{Type}SpaceData` (e.g., `ProfileSpaceData`, `TokenSpaceData`, `ProposalSpaceData`)

### Examples
```typescript
// Profile Space
export const ProfileSpace = ({ ... }: ProfileSpaceProps) => { ... }
interface ProfileSpaceData extends SpaceData { ... }

// Token Space  
export const TokenSpace = ({ ... }: TokenSpaceProps) => { ... }
interface TokenSpaceData extends SpaceData { ... }

// Proposal Space
export const ProposalSpace = ({ ... }: ProposalSpaceProps) => { ... }
interface ProposalSpaceData extends SpaceData { ... }
```

This consistent naming makes the codebase easier to understand and maintain.

## Design Principles

### 1. Separation of Concerns

- **Page Components**: Handle server-side data loading and routing
- **Space Components**: Handle type-specific logic and configuration
- **PublicSpace**: Handle common functionality shared across all space types

### 2. Props Over Context

- Data flows down through props rather than context
- Type-specific data is loaded server-side and passed as props
- Common data (like spaceId) is managed by PublicSpace

### 3. Consistent Patterns

- All space types follow the same architectural pattern
- Common functionality is centralized in PublicSpace
- Type-specific logic is isolated in space components

### 4. Performance Optimization

- Server-side data loading for better performance
- Efficient space resolution and caching
- Lazy loading of space tabs

## Benefits

1. **Consistency**: All space types follow the same pattern
2. **Maintainability**: Common functionality is centralized
3. **Performance**: Server-side loading and efficient caching
4. **Type Safety**: Strong typing with TypeScript
5. **Scalability**: Easy to add new space types
6. **Testability**: Clear separation makes testing easier

## Adding New Space Types

To add a new space type:

1. **Create page component** for server-side data loading
2. **Create space component** with type-specific logic
3. **Define space data interface** extending `SpaceData`
4. **Add space type** to `SPACE_TYPES` enum
5. **Update PublicSpace** to handle new space type in resolution logic
6. **Add space registration** logic if needed

The pattern ensures new space types integrate seamlessly with existing functionality while maintaining consistency across the application.
