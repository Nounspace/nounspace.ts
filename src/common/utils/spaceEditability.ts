import { isNil } from 'lodash';
import { Address, isAddressEqual } from 'viem';
import { MasterToken } from '@/common/providers/TokenProvider';
import { useAppStore } from '../data/stores/app';

export type EditabilityCheck = {
  isEditable: boolean;
  isLoading: boolean;
};

export type EditabilityContext = {
  currentUserFid: number | null;
  // Editable spaces
  editableSpaces?: Record<string, string>;

  currentUserIdentityPublicKey?: string | null;
  // Profile ownership
  spaceOwnerFid?: number;
  // Contract ownership
  spaceOwnerAddress?: Address;
  // Token-specific data
  tokenData?: MasterToken;
  // User's wallets for address ownership checks
  wallets?: { address: Address }[];
  // Space type
  isTokenPage?: boolean;
  // Space ID for checking editableSpaces
  spaceId?: string;
  
};

export const createEditabilityChecker = (context: EditabilityContext) => {
  const {
    currentUserFid,
    currentUserIdentityPublicKey,
    spaceOwnerFid,
    spaceOwnerAddress,
    tokenData,
    wallets = [],
    isTokenPage = false,
    spaceId,
    editableSpaces,
  } = context;

  
  // First, check if the space is already marked as editable in the store
  if (spaceId && editableSpaces && editableSpaces[spaceId]) {
    return { isEditable: true, isLoading: false };
  }

  // If we don't have any authentication method, we're definitely not editable
  if (isNil(currentUserFid) && isNil(currentUserIdentityPublicKey) && (!wallets || wallets.length === 0)) {
    return { isEditable: false, isLoading: false };
  }

  let isEditable = false;

  // For token spaces, check requestor and ownership
  if (isTokenPage) {
    // Check if user is the owner by FID
    if (
      spaceOwnerFid &&
      !isNil(currentUserFid) &&
      currentUserFid === spaceOwnerFid
    ) {
      isEditable = true;
    }

    // Check if user owns the wallet address - handles both direct contract ownership
    // and Empire token ownership through tokenData.empireData.owner
    const ownerAddress =
      spaceOwnerAddress || (tokenData?.empireData?.owner as Address | undefined);
    if (
      !isEditable &&
      ownerAddress &&
      wallets.some((w) => isAddressEqual(w.address as Address, ownerAddress))
    ) {
      isEditable = true;
    }

    // Check Clanker requestor status
    if (
      !isEditable &&
      tokenData?.clankerData?.requestor_fid && 
      !isNil(currentUserFid) && 
      currentUserFid === Number(tokenData.clankerData.requestor_fid)
    ) {
      isEditable = true;
    }
  } else {
    // For profile spaces, check FID match
    if (
      spaceOwnerFid &&
      !isNil(currentUserFid) &&
      currentUserFid === spaceOwnerFid
    ) {
      isEditable = true;
    }
  }

  return { isEditable, isLoading: false };
};