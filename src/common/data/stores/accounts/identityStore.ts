import { isArray, find, isUndefined, isNull, findIndex } from "lodash";
import { Wallet } from "@privy-io/react-auth";
import { secp256k1 } from "@noble/curves/secp256k1";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { managedNonce, randomBytes } from "@noble/ciphers/webcrypto";
import {
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
  utf8ToBytes,
} from "@noble/ciphers/utils";
import { StoreGet, StoreSet } from "..";
import { AccountStore } from ".";
import { createClient } from "../../database/supabase/clients/component";
import axiosBackend from "../../api/backend";
import {
  IdentityRequest,
  IdentityResponse,
  UnsignedIdentityRequest,
} from "@/pages/api/space/identities";
import { SignMessageFunctionSignature } from "./privyStore";
import { rootKeyPath } from "@/constants/supabase";
import stringify from "fast-json-stable-stringify";
import moment from "moment";
import axios from "axios";
import {
  SignedFile,
  UnsignedFile,
  hashObject,
  signSignable,
} from "@/common/lib/signedFiles";
import { PreSpaceKeys } from "./prekeyStore";
import { FidsLinkedToIdentityResponse } from "@/pages/api/fid-link";

export interface SpaceKeys {
  publicKey: string;
  privateKey: string;
}

type RootSpaceKeys = SpaceKeys & {
  type: "root";
  salt: string;
};

export interface SpaceIdentity {
  rootKeys: RootSpaceKeys;
  preKeys: PreSpaceKeys[];
  associatedFids: number[];
}

interface IdentityState {
  currentSpaceIdentityPublicKey: string;
  spaceIdentities: SpaceIdentity[];
  walletIdentities: {
    [key: string]: IdentityRequest[];
  };
}

interface IdentityActions {
  loadIdentitiesForWallet: (wallet: Wallet) => Promise<IdentityRequest[]>;
  decryptIdentityKeys: (
    signMessage: SignMessageFunctionSignature,
    wallet: Wallet,
    identityPublicKey: string,
  ) => Promise<void>;
  createIdentityForWallet: (
    signMessage: SignMessageFunctionSignature,
    wallet: Wallet,
  ) => Promise<string>;
  setCurrentIdentity: (publicKey: string) => void;
  getCurrentIdentity: () => SpaceIdentity | undefined;
  getCurrentIdentityIndex: () => number;
  getIdentitiesForWallet: (wallet: Wallet) => IdentityRequest[];
  getFidsForCurrentIdentity: () => Promise<void>;
}

export type IdentityStore = IdentityState & IdentityActions;

export const identityDefault: IdentityState = {
  currentSpaceIdentityPublicKey: "",
  spaceIdentities: [],
  walletIdentities: {},
};

class IdentitytDecryptError extends Error {
  constructor(
    identityPublicKey: string,
    walletAddress: string,
    message: string = "",
    ...args
  ) {
    super(
      `Unable to decrypt identity ${identityPublicKey} for wallet ${walletAddress}: ${message}`,
      ...args,
    );
  }
}

const moreInfo = "For more info: https://nounspace.com/signatures/";
const identityMessaage = "SPACE Identity:";

function randomNonce(length = 32) {
  return bytesToHex(randomBytes(length));
}

function generateMessage(nonce) {
  return `${identityMessaage}\n${nonce}\n${moreInfo}`;
}

export function stringToCipherKey(str: string): Uint8Array {
  return hkdf(sha256, str, "salt", "", 32);
}

async function decryptKeyFile(
  signMessage: SignMessageFunctionSignature,
  wallet: Wallet,
  nonce: string,
  encryptedBlob: Uint8Array,
): Promise<RootSpaceKeys | PreSpaceKeys> {
  const signature = await signMessage(wallet, generateMessage(nonce));
  const cipher = managedNonce(xchacha20poly1305)(stringToCipherKey(signature));
  return JSON.parse(bytesToUtf8(cipher.decrypt(encryptedBlob))) as
    | RootSpaceKeys
    | PreSpaceKeys;
}

async function encryptKeyFile(
  signMessage: SignMessageFunctionSignature,
  wallet: Wallet,
  nonce: string,
  keysToEncrypt: RootSpaceKeys | PreSpaceKeys,
): Promise<Uint8Array> {
  const signature = await signMessage(wallet, generateMessage(nonce));
  const cipher = managedNonce(xchacha20poly1305)(stringToCipherKey(signature));
  return cipher.encrypt(utf8ToBytes(stringify(keysToEncrypt)));
}

export const identityStore = (
  set: StoreSet<AccountStore>,
  get: StoreGet<AccountStore>,
): IdentityStore => ({
  ...identityDefault,
  getCurrentIdentity: () => {
    const state = get();
    return find(state.spaceIdentities, {
      rootKeys: { publicKey: state.currentSpaceIdentityPublicKey },
    });
  },
  getCurrentIdentityIndex: () => {
    const state = get();
    return findIndex(state.spaceIdentities, {
      rootKeys: { publicKey: state.currentSpaceIdentityPublicKey },
    });
  },
  setCurrentIdentity: (publicKey: string) => {
    set((draft) => {
      draft.currentSpaceIdentityPublicKey = publicKey;
    });
  },
  loadIdentitiesForWallet: async (wallet: Wallet) => {
    // Load Identity + Nonce + Wallet address info from DB
    const { data }: { data: IdentityResponse } = await axiosBackend.get(
      "/api/space/identities",
      {
        params: {
          address: wallet.address,
        },
      },
    );
    const walletIdentities = data.value
      ? isArray(data.value)
        ? data.value
        : [data.value]
      : [];
    set((draft) => {
      draft.walletIdentities[wallet.address] = walletIdentities;
    });
    return walletIdentities;
  },
  getIdentitiesForWallet: (wallet: Wallet) => {
    return get().walletIdentities[wallet.address] || [];
  },
  decryptIdentityKeys: async (
    signMessage: SignMessageFunctionSignature,
    wallet: Wallet,
    identityPublicKey: string,
  ) => {
    const supabase = createClient();
    const walletIdentityInfo = find(get().walletIdentities[wallet.address], {
      identityPublicKey: identityPublicKey,
    });
    if (isUndefined(walletIdentityInfo)) {
      throw new IdentitytDecryptError(
        identityPublicKey,
        wallet.address,
        "Nonce not found",
      );
    }
    const {
      data: { publicUrl },
    } = await supabase.storage
      .from("private")
      .getPublicUrl(rootKeyPath(identityPublicKey, wallet.address));
    if (!publicUrl) {
      throw new IdentitytDecryptError(
        identityPublicKey,
        wallet.address,
        "Blob not found",
      );
    }
    const { data }: { data: Blob } = await axios.get(publicUrl, {
      responseType: "blob",
    });
    if (isNull(data)) {
      throw new IdentitytDecryptError(
        identityPublicKey,
        wallet.address,
        "Blob not found",
      );
    }
    const fileData = JSON.parse(await data.text()) as SignedFile;
    const keys = (await decryptKeyFile(
      signMessage,
      wallet,
      walletIdentityInfo.nonce,
      hexToBytes(fileData.fileData),
    )) as RootSpaceKeys;
    set((draft) => {
      draft.spaceIdentities.push({
        rootKeys: keys,
        preKeys: [],
        associatedFids: [],
      });
    });
  },
  createIdentityForWallet: async (
    signMessage: SignMessageFunctionSignature,
    wallet: Wallet,
  ) => {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey);
    const identityKeys: RootSpaceKeys = {
      publicKey: bytesToHex(publicKey),
      privateKey: bytesToHex(privateKey),
      type: "root",
      salt: randomNonce(32),
    };
    const nonce = randomNonce();
    const keyFile: UnsignedFile = {
      publicKey: bytesToHex(publicKey),
      fileData: bytesToHex(
        await encryptKeyFile(signMessage, wallet, nonce, identityKeys),
      ),
      fileType: "json",
      isEncrypted: true,
      timestamp: moment().toISOString(),
    };
    const signedKeyFile = signSignable(keyFile, privateKey);
    const identityRequestUnsigned: UnsignedIdentityRequest = {
      type: "Create",
      identityPublicKey: bytesToHex(publicKey),
      walletAddress: wallet.address,
      nonce,
      timestamp: moment().toISOString(),
    };
    const identityRequest: IdentityRequest = {
      ...identityRequestUnsigned,
      signature: secp256k1
        .sign(hashObject(identityRequestUnsigned), privateKey, {
          prehash: true,
        })
        .toCompactHex(),
    };
    const postData = {
      file: signedKeyFile,
      identityRequest,
    };
    await axiosBackend.post("/api/space/identities", postData, {
      headers: { "Content-Type": "application/json" },
    });
    set((draft) => {
      draft.spaceIdentities.push({
        rootKeys: identityKeys,
        preKeys: [],
        associatedFids: [],
      });
    });
    return identityKeys.publicKey;
  },
  getFidsForCurrentIdentity: async () => {
    const { data } = await axiosBackend.get<FidsLinkedToIdentityResponse>(
      "/api/fid-links/",
      { params: { identityPublicKey: get().currentSpaceIdentityPublicKey } },
    );
    if (!isUndefined(data.value)) {
      set((draft) => {
        draft.spaceIdentities[draft.getCurrentIdentityIndex()].associatedFids =
          data.value!.fids;
      });
    }
  },
});

export const partializedIdentityStore = (state: AccountStore) => ({
  currentSpaceIdentityPublicKey: state.currentSpaceIdentityPublicKey,
  spaceIdentities: state.spaceIdentities,
  walletIdentities: state.walletIdentities,
});
