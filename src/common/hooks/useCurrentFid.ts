import { useEffect, useState } from 'react';
import { useAuthenticatorManager } from '@/authenticators/AuthenticatorManager';
import { getFidCookie, setFidCookie } from '@/common/utils/auth/fidCookie';

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export function useCurrentFid() {
  const [currentFid, setCurrentFid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  useEffect(() => {
    const loadFid = async () => {
      try {
        // First check cookie
        const cachedFid = getFidCookie();
        if (cachedFid) {
          setCurrentFid(cachedFid);
          setIsLoading(false);
          return;
        }

        // If no cookie, check if user is signed into Farcaster
        const authNames = await authManagerGetInitializedAuthenticators();
        const isSignedIntoFarcaster = authNames.includes(FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME);
        
        if (!isSignedIntoFarcaster) {
          setCurrentFid(null);
          setIsLoading(false);
          return;
        }

        // Get FID from authenticator
        const authManagerResp = await authManagerCallMethod({
          requestingFidgetId: "root",
          authenticatorId: FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME,
          methodName: "getAccountFid",
          isLookup: true,
        });

        if (authManagerResp.result === "success") {
          const fid = authManagerResp.value as number;
          setCurrentFid(fid);
          setFidCookie(fid); // Cache the FID
          setIsLoading(false);
        } else {
          setCurrentFid(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading FID:', error);
        setCurrentFid(null);
        setIsLoading(false);
      }
    };

    loadFid();
  }, [authManagerLastUpdatedAt]);

  return { currentFid, isLoading };
} 