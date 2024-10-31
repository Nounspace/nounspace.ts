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
  const schemeResult = await authenticatorManager.callMethod({
    requestingFidgetId: fidgetId,
    authenticatorId: authenticatorName,
    methodName: "getSignerScheme",
    isLookup: true,
  });
  const scheme =
    schemeResult.result === "success"
      ? (schemeResult.value as SignatureScheme)
      : SignatureScheme.NONE;
  return {
    scheme,
    getSignerKey: async () => {
      const methodResult = await authenticatorManager.callMethod({
        requestingFidgetId: fidgetId,
        authenticatorId: authenticatorName,
        methodName: "getSignerPublicKey",
        isLookup: true,
      });
      if (methodResult.result === "success") {
        return ok(methodResult.value as Uint8Array);
      }
      return err(new HubError("unknown", {}));
    },
    signMessageHash: async (hash: Uint8Array) => {
      const methodResult = await authenticatorManager.callMethod(
        {
          requestingFidgetId: fidgetId,
          authenticatorId: authenticatorName,
          methodName: "signMessage",
          isLookup: false,
        },
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
  const [signer, setSigner] = useState<Signer>();
  const [fid, setFid] = useState(-1);
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined);

  useEffect(() => {
    authenticatorManager
      .getInitializedAuthenticators()
      .then((initilizedAuths) =>
        setIsLoadingSigner(indexOf(initilizedAuths, authenticatorName) === -1),
      );
  }, [authenticatorManager.lastUpdatedAt]);

  useEffect(() => {
    createFarcasterSignerFromAuthenticatorManager(
      authenticatorManager,
      fidgetId,
      authenticatorName,
    ).then((signer) => setSigner(signer));
  }, [authenticatorManager.lastUpdatedAt]);

  useEffect(() => {
    authenticatorManager
      .callMethod({
        requestingFidgetId: fidgetId,
        authenticatorId: authenticatorName,
        methodName: "getAccountFid",
        isLookup: true,
      })
      .then((methodResult) => {
        if (methodResult.result === "success") {
          return setFid(methodResult.value as number);
        }
        return setFid(-1);
      });
  }, [authenticatorManager.lastUpdatedAt]);

  // New effect to fetch the address
  useEffect(() => {
    authenticatorManager
      .callMethod({
        requestingFidgetId: fidgetId,
        authenticatorId: authenticatorName,
        methodName: "getAddress", // Adjust if different
        isLookup: true,
      })
      .then((methodResult) => {
        if (methodResult.result === "success") {
          const fetchedAddress = methodResult.value as string;
          const formattedAddress = fetchedAddress.startsWith("0x")
            ? (fetchedAddress as `0x${string}`)
            : (`0x${fetchedAddress}` as `0x${string}`);
          setAddress(formattedAddress);
        } else {
          console.error("Failed to retrieve address:", methodResult);
        }
      });
  }, [authenticatorManager.lastUpdatedAt]);

  return {
    authenticatorManager,
    isLoadingSigner,
    signer,
    fid,
    address, // Return the address as part of the hook result
  };
}
