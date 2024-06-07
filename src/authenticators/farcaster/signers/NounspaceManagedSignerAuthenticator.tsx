import React, { useEffect, useRef, useState } from "react";
import { AuthenticatorInitializer, createAuthenticator, makeAuthenticatorMethods } from "../..";
import { FarcasterSignerAuthenticatorData, FarcasterSignerAuthenticatorMethods, FarcasterRegistrationType, SignerStatus } from ".";
import { isUndefined } from "lodash";
import { ed25519 } from '@noble/curves/ed25519';
import { bytesToHex, hexToBytes } from "@noble/ciphers/utils";
import axiosBackend from "@/common/data/api/backend";
import { AxiosResponse } from "axios";
import { Button } from "@/common/ui/atoms/button";
import Spinner from "@/common/ui/atoms/spinner";
import { SignedKeyRequestResponse, SignerResponse } from "@/pages/api/signerRequests";
import QRCode from "@/common/ui/atoms/qr-code";

export type NounspaceDeveloperManagedSignerData = FarcasterSignerAuthenticatorData & {
  publicKeyHex?: string;
  privateKeyHex?: string;
  accountType?: FarcasterRegistrationType;
  status?: SignerStatus;
  signerUrl?: string;
  requestingWallet?: string;
};

const BACKEND_POLL_FREQUENCY = 2000;

class SignerNotProperlyInitializedError extends Error {
  constructor(message = "Signer not properly initialized", ...args) {
    super(message, ...args);
  }
}

function isDataInitialized(data: NounspaceDeveloperManagedSignerData, error = false) {
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
    const resp: AxiosResponse<SignerResponse<SignedKeyRequestResponse>> = await axiosBackend.get("/api/signerRequests", { params: {
      token: data.token,
    } });
    return resp.data.value!;
  };
}

const methods: FarcasterSignerAuthenticatorMethods<NounspaceDeveloperManagedSignerData> = {
  isReady: (data) => {
    return async () => data.status === "completed" && !isUndefined(data.publicKeyHex) && !isUndefined(data.privateKeyHex);
  },
  signMessage: (data) => {
    return async (messageHash: Uint8Array) => {
      if (isUndefined(data.publicKeyHex) || isUndefined(data.privateKeyHex)) {
        throw new SignerNotProperlyInitializedError();
      }

      return ed25519.sign(messageHash, data.privateKeyHex);
    };
  },
  getSignerPublicKey: (data) => {
    return async () => {
      isDataInitialized(data, true);
      return hexToBytes(data.publicKeyHex!);
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
      const resp = (await retrieveSignerData(data)());
      await saveData({
        ...data,
        signerFid: resp.requestFid || data.signerFid,
        status: resp.state || data.status || "pending",
        signerUrl: resp.deeplinkUrl || data.signerUrl,
      });
    };
  },
  createNewSigner: (data, saveData) => {
    return async () => {
      const newPrivKey = ed25519.utils.randomPrivateKey();
      const publicKeyHex = `0x${bytesToHex(ed25519.getPublicKey(newPrivKey))}`;
      const resp: AxiosResponse<SignerResponse<SignedKeyRequestResponse>> = await axiosBackend.post("/api/signerRequests", {
        publicKey: publicKeyHex,
        requestingWallet: data.requestingWallet,
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

const initializer: AuthenticatorInitializer<NounspaceDeveloperManagedSignerData> = ({ data, saveData, done }) => {
  const self = makeAuthenticatorMethods(methods, { data, saveData });
  const [loading, setLoading] = useState(false);
  const pollInterval = useRef<NodeJS.Timeout | undefined>();
  const doneInterval = useRef<NodeJS.Timeout | undefined>();

  function createSigner() {
    self.createNewSigner();
    startPolling();
  }

  function startPolling() {
    setLoading(true);
    pollInterval.current = setInterval(() => self.updateSignerInfo(), BACKEND_POLL_FREQUENCY);
    doneInterval.current = setInterval(() => {
      if (data.status === "completed" ) {
        done();
      }
    }, BACKEND_POLL_FREQUENCY);
  }

  useEffect(() => {
    if (data.state === "pending") {
      startPolling();
    }
    return () => {
      clearInterval(pollInterval.current);
      clearInterval(doneInterval.current);
    };
  });

  return (
    <>
      {
        (isUndefined(data.status) || !isDataInitialized(data) || data.status === "revoked") ? (
          <Button onClick={createSigner}>Link Warpcast Account</Button>
        ) : (
          loading && data.signerUrl ? <QRCode value={data.signerUrl} maxWidth={256}/> : <Spinner />
        )
      }
    </>
  );
};

const auth = createAuthenticator<
  NounspaceDeveloperManagedSignerData,
  FarcasterSignerAuthenticatorMethods<NounspaceDeveloperManagedSignerData>
>(
  "NounspaceFarcasterAuthenticator",
  methods,
  initializer
);

export default auth;