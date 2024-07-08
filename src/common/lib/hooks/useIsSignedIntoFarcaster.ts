import { useState, useEffect } from "react";
import { indexOf } from "lodash";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export const useIsSignedIntoFarcaster = () => {
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const { lastUpdatedAt, getInitializedAuthenticators } =
    useAuthenticatorManager();

  useEffect(() => {
    getInitializedAuthenticators().then((authNames) => {
      setIsSignedIntoFarcaster(
        indexOf(authNames, FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME) > -1,
      );
    });
  }, [lastUpdatedAt]);

  return isSignedIntoFarcaster;
};

export default useIsSignedIntoFarcaster;
