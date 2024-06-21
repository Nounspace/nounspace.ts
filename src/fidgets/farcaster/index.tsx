import { AuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import { HubError, Signer } from "@farcaster/core";
import { err, ok } from "neverthrow";

export const createFarcasterSignerFromAuthenticatorManager = async (
  authenticatorManager: AuthenticatorManager,
  fidgetId: string,
  authenticatorName: string = "farcaster:nounspace",
) => {
  const schemeResult = await authenticatorManager.callMethod(
    fidgetId,
    authenticatorName,
    "getSignerScheme",
  );
  const scheme = schemeResult.result === "success" ? schemeResult.value : null;
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
  } as Signer;
};
