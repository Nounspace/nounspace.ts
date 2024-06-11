import {
  isArray,
  find,
  isUndefined,
  isNull,
  first,
  map,
  compact,
  findIndex,
  sortBy,
  concat,
} from "lodash";
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
  IndentityResponse,
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
  signFile,
} from "@/common/lib/signedFiles";
import { PreKeyRequest, PreKeyResponse } from "@/pages/api/space/prekeys";

interface SpaceKeys {
  publicKey: string;
  privateKey: string;
}

type RootSpaceKeys = SpaceKeys & {
  type: "root";
};

type PreSpaceKeys = SpaceKeys & {
  type: "pre";
  timestamp: string;
};

export interface SpaceIdentity {
  rootKeys: RootSpaceKeys;
  preKeys: PreSpaceKeys[];
}

interface IndentityState {
  currentSpaceIdentityPublicKey: string;
  spaceIdentities: SpaceIdentity[];
  walletIdentities: {
    [key: string]: IdentityRequest[];
  };
}

interface IndentityActions {
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
  getIdentitiesForWallet: (wallet: Wallet) => IdentityRequest[];
  createSignedFile: (data: string, fileType: string) => Promise<SignedFile>;
  createEncryptedSignedFile: (
    data: string,
    fileType: string,
    useRootKey: boolean | undefined,
  ) => Promise<SignedFile>;
  decryptEncryptedSignedFile: (file: SignedFile) => Promise<string>;
  generatePreKey: () => Promise<PreSpaceKeys>;
  loadPreKeys: () => Promise<PreSpaceKeys[]>;
  getCurrentPrekey: () => PreSpaceKeys | undefined;
  addPreKeysToIdentity: (prekeys: PreSpaceKeys[]) => void;
}

export type IdentityStore = IndentityState & IndentityActions;

export const identityDefault: IndentityState = {
  currentSpaceIdentityPublicKey: "",
  spaceIdentities: [],
  walletIdentities: {},
};

class NoCurrentIdentity extends Error {
  constructor(...args) {
    super("There is no current Space Identity to use", ...args);
  }
}

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

class NoPreKeyFoundError extends Error {
  constructor(prekeyPublicKey: string, ...args) {
    super(
      `Unabled to decrypt file with public encryption key ${prekeyPublicKey}`,
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

function stringToCipherKey(str: string): Uint8Array {
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

export const indentityStore = (
  set: StoreSet<AccountStore>,
  get: StoreGet<IdentityStore>,
): IdentityStore => ({
  ...identityDefault,
  getCurrentIdentity: () => {
    const state = get();
    return find(state.spaceIdentities, {
      rootKeys: { publicKey: state.currentSpaceIdentityPublicKey },
    });
  },
  setCurrentIdentity: (publicKey: string) => {
    set((draft) => {
      draft.currentSpaceIdentityPublicKey = publicKey;
    });
  },
  loadIdentitiesForWallet: async (wallet: Wallet) => {
    // Load Indentity + Nonce + Wallet address info from DB
    const { data }: { data: IndentityResponse } = await axiosBackend.get(
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
    const walletIndentityInfo = find(get().walletIdentities[wallet.address], {
      identityPublicKey: identityPublicKey,
    });
    if (isUndefined(walletIndentityInfo)) {
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
      walletIndentityInfo.nonce,
      hexToBytes(fileData.fileData),
    )) as RootSpaceKeys;
    set((draft) => {
      draft.spaceIdentities.push({
        rootKeys: keys,
        preKeys: [],
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
    };
    const nonce = randomNonce();
    const keyFile: UnsignedFile = {
      publicKey: bytesToHex(publicKey),
      fileData: bytesToHex(
        await encryptKeyFile(signMessage, wallet, nonce, identityKeys),
      ),
      fileType: "json",
      isEncrypted: true,
    };
    const signedKeyFile = signFile(keyFile, privateKey);
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
      draft.spaceIdentities.push({ rootKeys: identityKeys, preKeys: [] });
    });
    return identityKeys.publicKey;
  },
  createSignedFile: async (data, fileType) => {
    const currentIdentity = get().getCurrentIdentity();
    if (isUndefined(currentIdentity)) {
      throw new NoCurrentIdentity();
    }
    return signFile(
      {
        fileData: data,
        fileType,
        publicKey: currentIdentity.rootKeys.publicKey,
        isEncrypted: false,
      },
      currentIdentity.rootKeys.privateKey,
    );
  },
  createEncryptedSignedFile: async (data, fileType, useRootKey = false) => {
    const key = useRootKey
      ? get().getCurrentIdentity()!.rootKeys
      : get().getCurrentPrekey() || (await get().generatePreKey());
    const cipher = managedNonce(xchacha20poly1305)(
      stringToCipherKey(
        bytesToHex(secp256k1.getSharedSecret(key.privateKey, key.publicKey)),
      ),
    );
    const file: UnsignedFile = {
      fileData: bytesToUtf8(cipher.encrypt(utf8ToBytes(data))),
      fileType,
      publicKey: key.publicKey,
      isEncrypted: true,
    };
    return signFile(file, key.privateKey);
  },
  decryptEncryptedSignedFile: async (file) => {
    if (!file.isEncrypted) {
      return file.fileData;
    }
    const encryptingKey = file.publicKey;
    // Find the pre key used to encrypt this file
    let keyPair = find(get().getCurrentIdentity()?.preKeys, {
      publicKey: encryptingKey,
    });
    // Try loading keys from the DB if key is not found
    if (isUndefined(keyPair)) {
      const preKeys = await get().loadPreKeys();
      keyPair = find(preKeys, { publicKey: encryptingKey });
    }
    // Error if key is still not found
    if (isUndefined(keyPair)) {
      throw new NoPreKeyFoundError(encryptingKey);
    }
    const cipher = managedNonce(xchacha20poly1305)(
      stringToCipherKey(
        bytesToHex(
          secp256k1.getSharedSecret(keyPair.privateKey, keyPair.publicKey),
        ),
      ),
    );
    return bytesToUtf8(cipher.decrypt(utf8ToBytes(file.fileData)));
  },
  generatePreKey: async () => {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey);
    const prekey: PreSpaceKeys = {
      publicKey: bytesToHex(publicKey),
      privateKey: bytesToHex(privateKey),
      type: "pre",
      timestamp: moment().toISOString(),
    };
    const keyFile = await get().createEncryptedSignedFile(
      stringify(prekey),
      "json",
      true,
    );
    const postData: PreKeyRequest = {
      file: keyFile,
      identityPublicKey: get().currentSpaceIdentityPublicKey,
      prekeyPublicKey: bytesToHex(publicKey),
    };

    // TO DO: Error handling
    await axiosBackend.post("/api/space/prekeys/", postData, {
      headers: { "Content-Type": "application/json" },
    });

    get().addPreKeysToIdentity([prekey]);
    return prekey;
  },
  addPreKeysToIdentity: (prekeys) => {
    set((draft) => {
      const currentIdentityIndex = findIndex(get().spaceIdentities, {
        rootKeys: { publicKey: get().currentSpaceIdentityPublicKey },
      });
      draft.spaceIdentities[currentIdentityIndex].preKeys = sortBy(
        concat(draft.spaceIdentities[currentIdentityIndex].preKeys, prekeys),
        ["timestamp"],
      );
    });
  },
  loadPreKeys: async () => {
    const keyFileLocs = await axiosBackend.get<PreKeyResponse>(
      "/api/space/prekeys",
      { params: { publicKey: get().getCurrentIdentity()?.rootKeys.publicKey } },
    );
    const supabase = createClient();
    const prekeys = compact(
      await Promise.all(
        map(keyFileLocs, async (loc) => {
          try {
            const {
              data: { publicUrl },
            } = await supabase.storage.from("private").getPublicUrl(loc);
            const { data }: { data: Blob } = await axios.get(publicUrl, {
              responseType: "blob",
            });
            const fileData = JSON.parse(await data.text()) as SignedFile;
            const decryptedFile =
              await get().decryptEncryptedSignedFile(fileData);
            const preKeys = JSON.parse(decryptedFile) as PreSpaceKeys;
            return preKeys;
          } catch (e) {
            console.error(e);
            return undefined;
          }
        }),
      ),
    );
    get().addPreKeysToIdentity(prekeys);
    return prekeys;
  },
  getCurrentPrekey: () => {
    return first(get().getCurrentIdentity()?.preKeys);
  },
});

export const partializedIdentityStore = (state: AccountStore) => ({
  currentSpaceIdentityPublicKey: state.currentSpaceIdentityPublicKey,
  spaceIdentities: state.spaceIdentities,
  walletIdentities: state.walletIdentities,
});
