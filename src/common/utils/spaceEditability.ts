import { isNil } from 'lodash';
import { Address, isAddressEqual } from 'viem';
import { MasterToken } from '@/common/providers/TokenProvider';

export type EditabilityCheck = {
  isEditable: boolean;
  isLoading: boolean;
};

export type EditabilityContext = {
  currentUserFid: number | null;
  currentUserIdentityPublicKey?: string | null;
  // Profile ownership
  spaceOwnerFid?: number;
  // Contract ownership
  spaceOwnerAddress?: Address;
  // Identity-based ownership
  spaceOwnerIdentities?: string[];
  // Token-specific data
  tokenData?: MasterToken;
  // User's wallets for address ownership checks
  wallets?: { address: Address }[];
  // Space type
  isTokenPage?: boolean;
};

export const createEditabilityChecker = (context: EditabilityContext) => {
  const {
    currentUserFid,
    currentUserIdentityPublicKey,
    spaceOwnerFid,
    spaceOwnerAddress,
    spaceOwnerIdentities,
    tokenData,
    wallets = [],
    isTokenPage = false,
  } = context;

  // console.log('Editability check context:', {
  //   currentUserFid,
  //   spaceOwnerFid,
  //   spaceOwnerAddress,
  //   tokenData: tokenData ? {
  //     hasClankerData: !!tokenData.clankerData,
  //     requestorFid: tokenData.clankerData?.requestor_fid,
  //   } : null,
  //   walletAddresses: wallets.map(w => w.address),
  //   isTokenPage,
  // });

  // If we don't have a current user identity (FID or public key), we're definitely not editable
  if (isNil(currentUserFid) && isNil(currentUserIdentityPublicKey)) {
    // console.log('Not editable: No current user identifier');
    return { isEditable: false, isLoading: false };
  }

  // For token spaces, check requestor and ownership
  if (isTokenPage) {
    // console.log('Checking token space editability');

    // Check if user owns via identity public key
    if (
      currentUserIdentityPublicKey &&
      spaceOwnerIdentities?.includes(currentUserIdentityPublicKey)
    ) {
      return { isEditable: true, isLoading: false };
    }

    // Check if user is the owner by FID first (doesn't require clankerData)
    if (
      spaceOwnerFid &&
      !isNil(currentUserFid) &&
      currentUserFid === spaceOwnerFid
    ) {
      // console.log('Editable: User owns by FID', {
      //   currentUserFid,
      //   spaceOwnerFid,
      // });
      return { isEditable: true, isLoading: false };
    }

    // Check if user owns the wallet address (doesn't require clankerData)
    const ownerAddress =
      spaceOwnerAddress || (tokenData?.empireData?.owner as Address | undefined);
    if (
      ownerAddress &&
      wallets.some((w) => isAddressEqual(w.address as Address, ownerAddress))
    ) {
      // console.log('Editable: User owns by address', {
      //   spaceOwnerAddress: ownerAddress,
      //   matchingWallet: wallets.find(w => w.address === ownerAddress),
      // });
      return { isEditable: true, isLoading: false };
    }

    // Only check requestor status if we have clankerData
    if (tokenData && !isNil(tokenData.clankerData)) {
      const requestorFid = tokenData.clankerData?.requestor_fid;
      if (
        requestorFid &&
        !isNil(currentUserFid) &&
        currentUserFid === Number(requestorFid)
      ) {
        // console.log('Editable: User is the requestor', {
        //   currentUserFid,
        //   requestorFid: Number(requestorFid),
        // });
        return { isEditable: true, isLoading: false };
      }
    } else {
      // console.log('Skipping requestor check: No clankerData available');
    }

    // console.log('Not editable: No matching ownership conditions met for token space');
  } else {
    // For profile spaces, just check FID match
    // console.log('Checking profile space editability');
    if (
      currentUserIdentityPublicKey &&
      spaceOwnerIdentities?.includes(currentUserIdentityPublicKey)
    ) {
      return { isEditable: true, isLoading: false };
    }

    if (
      spaceOwnerFid &&
      !isNil(currentUserFid) &&
      currentUserFid === spaceOwnerFid
    ) {
      // console.log('Editable: User owns profile space', {
      //   currentUserFid,
      //   spaceOwnerFid,
      // });
      return { isEditable: true, isLoading: false };
    }
    // console.log('Not editable: FIDs do not match for profile space', {
    //   currentUserFid,
    //   spaceOwnerFid,
    // });
  }

  // console.log('Final result: Not editable');
  return { isEditable: false, isLoading: false };
}; 