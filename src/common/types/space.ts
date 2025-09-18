import { SPACE_TYPES, SpaceTypeValue } from '@/common/constants/spaceTypes';
import { SpaceConfig } from '@/app/(spaces)/Space';
import { Address } from 'viem';
import { MasterToken } from '@/common/providers/TokenProvider';

// Base space interface with common properties
export interface SpaceData {
  // Metadata
  id: string | undefined;
  spaceName: string;
  spaceType: SpaceTypeValue;
  updatedAt: string;
  
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
