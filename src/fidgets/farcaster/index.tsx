import {
  AuthenticatorManager,
  useAuthenticatorManager,
} from "@/authenticators/AuthenticatorManager";
import { HubError, SignatureScheme, Signer } from "@farcaster/core";
import { indexOf } from "lodash";
import { err, ok } from "neverthrow";
import { useEffect, useState } from "react";

export const FARCASTER_AUTHENTICATOR_NAME = "farcaster:nounspace";

const createFarcasterSignerFromAuthenticatorManager = async (
  authenticatorManager: AuthenticatorManager,
  fidgetId: string,
  authenticatorName: string = "farcaster:nounspace",
): Promise<Signer> => {
  const schemeResult = await authenticatorManager.callMethod(
    fidgetId,
    authenticatorName,
    "getSignerScheme",
  );
  const scheme =
    schemeResult.result === "success"
      ? (schemeResult.value as SignatureScheme)
      : SignatureScheme.NONE;
  return {
    scheme,
    getSignerKey: async () => {
      const methodResult = await authenticatorManager.callMethod(
        fidgetId,
        authenticatorName,
        "getSignerPublicKey",
      );
      if (methodResult.result === "success") {
        return ok(methodResult.value as Uint8Array);
      }
      return err(new HubError("unknown", {}));
    },
    signMessageHash: async (hash: Uint8Array) => {
      const methodResult = await authenticatorManager.callMethod(
        fidgetId,
        authenticatorName,
        "signMessage",
        hash,
      );
      if (methodResult.result === "success") {
        return ok(methodResult.value as Uint8Array);
      }
      return err(new HubError("unknown", {}));
    },
  };
};

export function useFarcasterSigner(
  fidgetId: string,
  authenticatorName: string = "farcaster:nounspace",
) {
  const authenticatorManager = useAuthenticatorManager();
  const [isLoadingSigner, setIsLoadingSigner] = useState(true);
  useEffect(() => {
    authenticatorManager
      .getInitializedAuthenticators()
      .then((initilizedAuths) =>
        setIsLoadingSigner(
          indexOf(initilizedAuths, FARCASTER_AUTHENTICATOR_NAME) === -1,
        ),
      );
  }, [authenticatorManager.lastUpdatedAt]);
  const [signer, setSigner] = useState<Signer>();
  useEffect(() => {
    createFarcasterSignerFromAuthenticatorManager(
      authenticatorManager,
      fidgetId,
      authenticatorName,
    ).then((signer) => setSigner(signer));
  }, [authenticatorManager.lastUpdatedAt]);
  const [fid, setFid] = useState(-1);
  useEffect(() => {
    authenticatorManager
      .callMethod(fidgetId, FARCASTER_AUTHENTICATOR_NAME, "getAccountFid")
      .then((methodResult) => {
        if (methodResult.result === "success") {
          setFid(methodResult.value as number);
        }
        return setFid(-1);
      });
  }, [authenticatorManager.lastUpdatedAt]);

  return {
    authenticatorManager,
    isLoadingSigner,
    signer,
    fid,
  };
}
