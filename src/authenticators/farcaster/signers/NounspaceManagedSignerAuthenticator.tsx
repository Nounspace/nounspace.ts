import React, { useEffect, useRef, useState } from "react";
import {
  AuthenticatorInitializer,
  createAuthenticator,
  makeAuthenticatorMethods,
} from "@/authenticators/index";
import {
  FarcasterSignerAuthenticatorData,
  FarcasterSignerAuthenticatorMethods,
  FarcasterRegistrationType,
  SignerStatus,
} from ".";
import { isEqual, isUndefined, startsWith } from "lodash";
import { ed25519 } from "@noble/curves/ed25519";
import { bytesToHex, hexToBytes } from "@noble/ciphers/utils";
import axiosBackend from "@/common/data/api/backend";
import { AxiosResponse } from "axios";
import { Button } from "@/common/components/atoms/button";
import Spinner from "@/common/components/atoms/spinner";
import {
  SignedKeyRequestResponse,
  SignerResponse,
} from "@/pages/api/signerRequests";
import QRCode from "@/common/components/atoms/qr-code";
import { SignatureScheme } from "@farcaster/core";
import Link from "next/link";

export type NounspaceDeveloperManagedSignerData =
  FarcasterSignerAuthenticatorData & {
    publicKeyHex?: string;
    privateKeyHex?: string;
    accountType?: FarcasterRegistrationType;
    status?: SignerStatus;
    signerUrl?: string;
  };

const BACKEND_POLL_FREQUENCY = 1000;

class SignerNotProperlyInitializedError extends Error {
  constructor(message = "Signer not properly initialized", ...args) {
    super(message, ...args);
  }
}

function isDataInitialized(
  data: NounspaceDeveloperManagedSignerData,
  error = false,
) {
  if (
    isUndefined(data.privateKeyHex) ||
    isUndefined(data.publicKeyHex) ||
    isUndefined(data.accountType)
  ) {
    if (error) {
      throw new SignerNotProperlyInitializedError();
    }
    return false;
  }
  return true;
}

const retrieveSignerData = (data) => {
  return async () => {
    const resp: AxiosResponse<SignerResponse<SignedKeyRequestResponse>> =
      await axiosBackend.get("/api/signerRequests", {
        params: {
          token: data.token,
        },
      });
    return resp.data.value!;
  };
};

function stripKeyOhEx(key: string) {
  if (startsWith(key, "0x")) {
    return key.slice(2);
  }
  return key;
}

const methods: FarcasterSignerAuthenticatorMethods<NounspaceDeveloperManagedSignerData> =
  {
    isReady: (data) => {
      return async () => {
        return (
          data.status === "completed" &&
          !isUndefined(data.publicKeyHex) &&
          !isUndefined(data.privateKeyHex)
        );
      };
    },
    getSignerScheme: () => {
      return async () => {
        return SignatureScheme.ED25519;
      };
    },
    signMessage: (data) => {
      return async (messageHash: Uint8Array) => {
        if (isUndefined(data.publicKeyHex) || isUndefined(data.privateKeyHex)) {
          throw new SignerNotProperlyInitializedError();
        }

        return ed25519.sign(messageHash, stripKeyOhEx(data.privateKeyHex));
      };
    },
    getSignerPublicKey: (data) => {
      return async () => {
        isDataInitialized(data, true);
        return hexToBytes(stripKeyOhEx(data.publicKeyHex!));
      };
    },
    getSignerStatus: (data) => {
      return async () => {
        isDataInitialized(data, true);
        if (data.accountType === "account") {
          return "completed";
        }
        return (await retrieveSignerData(data)()).state;
      };
    },
    updateSignerInfo: (data, saveData) => {
      return async () => {
        if (!isDataInitialized(data)) {
          return;
        }
        const resp = await retrieveSignerData(data)();
        const newData = {
          ...data,
          signerFid: resp.requestFid || data.signerFid,
          accountFid: resp.userFid || data.accountFid,
          status: resp.state || data.status || "pending",
          signerUrl: resp.deeplinkUrl || data.signerUrl,
        };
        if (!isEqual(newData, data)) await saveData(newData);
      };
    },
    createNewSigner: (data, saveData) => {
      return async () => {
        const newPrivKey = ed25519.utils.randomPrivateKey();
        const publicKeyHex = `0x${bytesToHex(ed25519.getPublicKey(newPrivKey))}`;
        const resp: AxiosResponse<SignerResponse<SignedKeyRequestResponse>> =
          await axiosBackend.post("/api/signerRequests", {
            publicKey: publicKeyHex,
            requestingWallet: data.currentWalletAddress,
          });
        const signerData = resp.data.value!;
        await saveData({
          ...data,
          accountType: "signer",
          publicKeyHex: publicKeyHex,
          privateKeyHex: `0x${bytesToHex(newPrivKey)}`,
          signerFid: signerData.requestFid,
          status: signerData.state || "pending",
          signerUrl: signerData.deeplinkUrl,
          token: signerData.token,
          accountFid: signerData.userFid,
        });
        return signerData.deeplinkUrl;
      };
    },
    createNewAccount: (_data, _saveData) => {
      return () => {
        throw new Error("Function not implemented.");
      };
    },
    getSignerFid: (data) => {
      return async () => {
        isDataInitialized(data, true);
        if (data.accountType == "account") {
          return data.accountFid!;
        } else {
          return data.signerFid!;
        }
      };
    },
    getAccountFid: (data) => {
      return async () => {
        isDataInitialized(data, true);
        return data.accountFid!;
      };
    },
    getRegistrationType: (data) => {
      return async () => {
        isDataInitialized(data, true);
        return data.accountType!;
      };
    },
  };

const initializer: AuthenticatorInitializer<
  NounspaceDeveloperManagedSignerData
> = ({ data, saveData, done }) => {
  const self = makeAuthenticatorMethods(methods, { data, saveData }, true);
  const [loading, setLoading] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout | undefined>();
  const doneInterval = useRef<NodeJS.Timeout | undefined>();

  function createSigner() {
    self.createNewSigner();
    startPolling();
  }

  function startPolling() {
    setLoading(true);
    pollInterval.current = setInterval(
      self.updateSignerInfo,
      BACKEND_POLL_FREQUENCY,
    );
    doneInterval.current = setInterval(() => {
      if (data.status === "completed") {
        done();
      }
    }, BACKEND_POLL_FREQUENCY);
  }

  useEffect(() => {
    if (isDataInitialized(data)) {
      startPolling();
    }
    return () => {
      clearInterval(pollInterval.current);
      clearInterval(doneInterval.current);
    };
  });

  return (
    <>
      {isUndefined(data.status) ||
      !isDataInitialized(data) ||
      data.status === "revoked" ? (
        <Button onClick={createSigner}>Link Warpcast Account</Button>
      ) : loading && data.signerUrl ? (
        <>
          <QRCode value={data.signerUrl} maxWidth={256} />
          <Link href={data.signerUrl}>
            <p>On mobile? Click here</p>
          </Link>
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
};
initializer.displayName = "NounspaceDeveloperManagedSignerInitializer";

const auth = createAuthenticator<
  NounspaceDeveloperManagedSignerData,
  FarcasterSignerAuthenticatorMethods<NounspaceDeveloperManagedSignerData>
>("Nounspace Managed Farcaster Signer", methods, initializer);

export default auth;
