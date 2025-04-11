import { isNil } from 'lodash';
import { Address } from 'viem';
import { MasterToken } from '@/common/providers/TokenProvider';

export type EditabilityCheck = {
  isEditable: boolean;
  isLoading: boolean;
};

export type EditabilityContext = {
  currentUserFid: number | null;
  // Profile ownership
  spaceOwnerFid?: number;
  // Contract ownership
  spaceOwnerAddress?: Address;
  // Token-specific data
  tokenData?: MasterToken;
  // User's wallets for address ownership checks
  wallets?: { address: Address }[];
};

export const createEditabilityChecker = (context: EditabilityContext) => {
  const {
    currentUserFid,
    spaceOwnerFid,
    spaceOwnerAddress,
    tokenData,
    wallets = [],
  } = context;

  // If we don't have a current user FID, we're definitely not editable
  if (isNil(currentUserFid)) {
    return { isEditable: false, isLoading: false };
  }

  // If we're still loading any required data, return loading state
  if (
    (spaceOwnerAddress && isNil(wallets)) ||
    (tokenData && isNil(tokenData.clankerData))
  ) {
    return { isEditable: false, isLoading: true };
  }

  // Check if user is the space owner by FID (for profile spaces)
  if (spaceOwnerFid && currentUserFid === spaceOwnerFid) {
    return { isEditable: true, isLoading: false };
  }

  // Check if user is the space owner by address (for contract spaces)
  if (spaceOwnerAddress && wallets.some(w => w.address === spaceOwnerAddress)) {
    return { isEditable: true, isLoading: false };
  }

  // Check if user is the token requestor (for contract spaces)
  if (tokenData) {
    const requestorFid = tokenData.clankerData?.requestor_fid;
    if (requestorFid && currentUserFid === Number(requestorFid)) {
      return { isEditable: true, isLoading: false };
    }
  }

  return { isEditable: false, isLoading: false };
}; 