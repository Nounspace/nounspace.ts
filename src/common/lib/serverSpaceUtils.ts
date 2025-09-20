import { SPACE_TYPES } from '@/common/types/spaceData';

interface ModifiableSpace {
  spaceId: string;
  fid?: number;
  contractAddress?: string;
  proposalId?: string;
  network?: string;
}

interface ModifiableSpacesResponse {
  value: {
    spaces: ModifiableSpace[];
  } | null;
}

/**
 * Check if a space already exists for the given identity and space type
 * Uses the existing API endpoint to maintain consistency with client-side logic
 */
export async function checkExistingSpaceServerSide(
  identityPublicKey: string,
  spaceType: 'profile' | 'token' | 'proposal',
  identifier: {
    fid?: number;
    contractAddress?: string;
    proposalId?: string;
    network?: string;
  }
): Promise<string | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      identityPublicKey,
    });

    // Add space-specific identifier to params
    if (spaceType === 'profile' && identifier.fid) {
      // For profile spaces, we don't need additional params
    } else if (spaceType === 'token' && identifier.contractAddress && identifier.network) {
      // For token spaces, we need to check by contract address and network
      // The API will return all spaces for the identity, we'll filter client-side
    } else if (spaceType === 'proposal' && identifier.proposalId) {
      params.append('proposalId', identifier.proposalId);
    }

    const response = await fetch(`${baseUrl}/api/space/registry?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to check existing spaces:', response.status, response.statusText);
      return null;
    }

    const data: ModifiableSpacesResponse = await response.json();

    if (!data.value?.spaces) {
      return null;
    }

    // Find matching space based on type and identifier
    const existingSpace = data.value.spaces.find((space) => {
      if (spaceType === 'profile') {
        return space.fid === identifier.fid;
      } else if (spaceType === 'token') {
        return (
          space.contractAddress === identifier.contractAddress &&
          space.network === identifier.network
        );
      } else if (spaceType === 'proposal') {
        return space.proposalId === identifier.proposalId;
      }
      return false;
    });

    return existingSpace?.spaceId || null;
  } catch (error) {
    console.error('Error checking existing space server-side:', error);
    return null;
  }
}

/**
 * Check if a profile space exists for the given FID
 */
export async function checkExistingProfileSpace(
  identityPublicKey: string,
  fid: number
): Promise<string | null> {
  return checkExistingSpaceServerSide(identityPublicKey, 'profile', { fid });
}

/**
 * Check if a token space exists for the given contract address and network
 */
export async function checkExistingTokenSpace(
  identityPublicKey: string,
  contractAddress: string,
  network: string
): Promise<string | null> {
  return checkExistingSpaceServerSide(identityPublicKey, 'token', {
    contractAddress,
    network,
  });
}

/**
 * Check if a proposal space exists for the given proposal ID
 */
export async function checkExistingProposalSpace(
  identityPublicKey: string,
  proposalId: string
): Promise<string | null> {
  return checkExistingSpaceServerSide(identityPublicKey, 'proposal', { proposalId });
}
