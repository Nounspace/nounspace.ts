import React, { useEffect, useRef, useState } from "react";
import { AuthenticatorInitializer, createAuthenticator, makeAuthenticatorMethods } from "..";
import { FarcasterAuthenticatorData, FarcasterAuthenticatorMethods, FarcasterRegistrationType, SignerStatus } from ".";
import { isUndefined } from "lodash";
import { ed25519 } from '@noble/curves/ed25519';
import { bytesToHex, hexToBytes } from "@noble/ciphers/utils";
import axiosBackend from "@/common/data/api/backend";
import { AxiosResponse } from "axios";
import { DeveloperManagedSigner } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { Button } from "@/common/ui/atoms/button";
import Spinner from "@/common/ui/atoms/spinner";
import { SignerResponse } from "@/pages/api/signerRequests";
import QRCode from "@/common/ui/atoms/qr-code";

export type NounspaceDeveloperManagedSignerData = FarcasterAuthenticatorData & {
  publicKeyHex?: string;
  privateKeyHex?: string;
  accountType?: FarcasterRegistrationType;
  status?: SignerStatus;
  signerUrl?: string;
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
    const resp: AxiosResponse<SignerResponse<DeveloperManagedSigner>> = await axiosBackend.get("/api/signerRequests", { params: {
      publicKey: data.publicKeyHex,
    } });
    return resp.data.value!;
  };
}

const methods: FarcasterAuthenticatorMethods<NounspaceDeveloperManagedSignerData> = {
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
        return "approved";
      }
      return (await retrieveSignerData(data)()).status;
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
        signerFid: resp.fid || data.signerFid,
        status: resp.status || data.status || "pending_approval",
        signerUrl: resp.signer_approval_url || data.signerUrl,
      });
    };
  },
  createNewSigner: (data, saveData) => {
    return async () => {
      const newPrivKey = ed25519.utils.randomPrivateKey();
      const publicKeyHex = `0x${bytesToHex(ed25519.getPublicKey(newPrivKey))}`;
      const resp: AxiosResponse<SignerResponse<DeveloperManagedSigner>> = await axiosBackend.post("/api/signerRequests", { publicKey: publicKeyHex });
      const signerData = resp.data.value!;
      await saveData({
        accountType: "signer",
        publicKeyHex: publicKeyHex,
        privateKeyHex: `0x${bytesToHex(newPrivKey)}`,
        signerFid: signerData.fid,
        status: signerData.status || "pending_approval",
        signerUrl: signerData.signer_approval_url,
      });
      return signerData.signer_approval_url;
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
      if (data.status === "approved" ) {
        done();
      }
    }, BACKEND_POLL_FREQUENCY);
  }

  useEffect(() => {
    if (data.status === "pending_approval") {
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

export default createAuthenticator<
  NounspaceDeveloperManagedSignerData,
  FarcasterAuthenticatorMethods<NounspaceDeveloperManagedSignerData>
>(
  "NounspaceFarcasterAuthenticator",
  methods,
  initializer
);