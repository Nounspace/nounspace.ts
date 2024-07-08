import { useEffect, useState } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import useIsSignedIntoFarcaster from "@/common/lib/hooks/useIsSignedIntoFarcaster";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export const useCurrentUserFid = () => {
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const { callMethod: authManagerCallMethod, lastUpdatedAt } =
    useAuthenticatorManager();
  const isSignedIntoFarcaster = useIsSignedIntoFarcaster();

  useEffect(() => {
    if (!isSignedIntoFarcaster || !lastUpdatedAt) return;

    const fetchCurrentUserFid = async () => {
      const authManagerResp = await authManagerCallMethod({
        requestingFidgetId: "root",
        authenticatorId: FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME,
        methodName: "getAccountFid",
        isLookup: true,
      });
      if (authManagerResp.result === "success") {
        setCurrentUserFid(authManagerResp.value as number);
      }
    };

    fetchCurrentUserFid();
  }, [isSignedIntoFarcaster, lastUpdatedAt]);

  return currentUserFid;
};

export default useCurrentUserFid;
