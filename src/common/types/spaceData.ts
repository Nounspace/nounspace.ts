import { SpaceConfig } from '@/app/(spaces)/Space';
import { Address } from 'viem';
import { MasterToken } from '@/common/providers/TokenProvider';
import { ProposalData } from '@/app/(spaces)/p/[proposalId]/utils';

// Space type definitions - the single source of truth for space types
export const SPACE_TYPES = {
  PROFILE: 'profile',
  TOKEN: 'token', 
  PROPOSAL: 'proposal',
} as const;

// TypeScript type derived from the constants (for type checking)
export type SpaceTypeValue = typeof SPACE_TYPES[keyof typeof SPACE_TYPES];

// Base space interface with common properties
export interface SpaceData {
  // Metadata
  id: string | undefined;
  spaceName: string;
  spaceType: SpaceTypeValue;
  updatedAt: string;
  
  // URL generation function for this space
  spacePageUrl: (tabName: string) => string;
  
  // Each space type implements its own logic for editability
  isEditable: (currentUserFid: number | undefined, wallets?: { address: Address }[]) => boolean;
  
  // Configuration - using Omit<SpaceConfig, "isEditable"> since isEditable is determined at runtime
  config: Omit<SpaceConfig, "isEditable">;
}

// Type-specific space interfaces
export interface ProfileSpaceData extends SpaceData {
  spaceType: typeof SPACE_TYPES.PROFILE;
  fid: number;
}

export interface TokenSpaceData extends SpaceData {
  spaceType: typeof SPACE_TYPES.TOKEN;
  contractAddress: string;
  network: string;
  ownerAddress: Address;
  tokenData?: MasterToken; // Optional to allow for loading states
}

export interface ProposalSpaceData extends SpaceData {
  spaceType: typeof SPACE_TYPES.PROPOSAL;
  proposalId: string;
  ownerAddress: Address;
  proposalData?: ProposalData;
}

// Union type for all spaces
export type Space = ProfileSpaceData | TokenSpaceData | ProposalSpaceData;

// Type guards (actual TypeScript type guards that narrow types)
export function isProfileSpace(space: SpaceData): space is ProfileSpaceData {
  return space.spaceType === SPACE_TYPES.PROFILE;
}

export function isTokenSpace(space: SpaceData): space is TokenSpaceData {
  return space.spaceType === SPACE_TYPES.TOKEN;
}

export function isProposalSpace(space: SpaceData): space is ProposalSpaceData {
  return space.spaceType === SPACE_TYPES.PROPOSAL;
}

