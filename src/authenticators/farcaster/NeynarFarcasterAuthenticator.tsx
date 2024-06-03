import React, { useEffect, useRef, useState } from "react";
import { AuthenticatorInitializer, createAuthenticator, makeAuthenticatorMethods } from "..";
import { FarcasterAuthenticatorData, FarcasterAuthenticatorMethods, FarcasterRegistrationType, SignerStatus } from ".";
import { isUndefined } from "lodash";
import { ed25519 } from '@noble/curves/ed25519';
import { bytesToHex, hexToBytes } from "@noble/ciphers/utils";
import axiosBackend from "@/common/data/api/backend";
import { AxiosResponse } from "axios";
import QRCode from "react-qr-code";
import { DeveloperManagedSigner } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { FidgetSpinner } from "react-loader-spinner";
import { Button } from "@/common/ui/atoms/button";

type NeynarDeveloperManagedSignerData = FarcasterAuthenticatorData & {
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

function isDataInitialized(data: NeynarDeveloperManagedSignerData, error = false) {
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
    const resp: AxiosResponse<DeveloperManagedSigner> = await axiosBackend.get("/api/signerRequests", { params: {
      publicKey: data.publicKeyHex,
    } });
    return resp.data;
  };
}

const methods: FarcasterAuthenticatorMethods<NeynarDeveloperManagedSignerData> = {
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
        signerFid: resp.fid,
        status: resp.status || "pending_approval",
        signerUrl: resp.signer_approval_url,
      });
    };
  },
  createNewSigner: (data, saveData) => {
    return async () => {
      const newPrivKey = ed25519.utils.randomPrivateKey();
      const publicKeyHex = bytesToHex(ed25519.getPublicKey(newPrivKey));
      const resp: AxiosResponse<DeveloperManagedSigner> = await axiosBackend.post("/api/signerRequests", { publicKey: publicKeyHex });
      await saveData({
        accountType: "signer",
        publicKeyHex: publicKeyHex,
        privateKeyHex: bytesToHex(newPrivKey),
        signerFid: resp.data.fid,
        status: resp.data.status || "pending_approval",
        signerUrl: resp.data.signer_approval_url,
      });
      return resp.data.signer_approval_url;
    };
  },
  createNewAccount: (_data, _saveData) => {
    throw new Error("Function not implemented.");
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

const initializer: AuthenticatorInitializer<NeynarDeveloperManagedSignerData> = async ({ data, saveData, done }) => {
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
    <div>
      {
        (isUndefined(data.status) || !isDataInitialized(data) || data.status === "revoked") ? (
          <Button onClick={createSigner}>Link Warpcast Account</Button>
        ) : (
          loading && data.signerUrl ? <QRCode value={data.signerUrl}/> : <FidgetSpinner />
        )
      }
    </div>
  );
};

export default createAuthenticator<
  NeynarDeveloperManagedSignerData,
  FarcasterAuthenticatorMethods<NeynarDeveloperManagedSignerData>
>(
  "NeynarFarcasterAuthenticator",
  methods,
  initializer
);