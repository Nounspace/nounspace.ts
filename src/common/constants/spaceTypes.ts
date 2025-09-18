// Space type definitions - the single source of truth for space types
export const SPACE_TYPES = {
  PROFILE: 'profile',
  TOKEN: 'token', 
  PROPOSAL: 'proposal',
} as const;

// TypeScript type derived from the constants (for type checking)
export type SpaceTypeValue = typeof SPACE_TYPES[keyof typeof SPACE_TYPES];

// Runtime utility function for inferring the space type from data
export function inferSpaceType(space: any): SpaceTypeValue {
  if (!space) return SPACE_TYPES.PROFILE;
  
  // Use explicit type if available
  if (space.spaceType) return space.spaceType;
  
  // Otherwise infer from data
  if (space.proposalId) return SPACE_TYPES.PROPOSAL;
  if (space.contractAddress) return SPACE_TYPES.TOKEN;
  return SPACE_TYPES.PROFILE;
}
