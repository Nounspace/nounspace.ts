import {
  SignedFile,
  UnsignedFile,
  signSignable,
} from "@/common/lib/signedFiles";
import { PreKeyRequest, PreKeyResponse } from "@/pages/api/space/prekeys";
import { SpaceKeys, stringToCipherKey } from "./identityStore";
import { StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import {
  compact,
  concat,
  find,
  findIndex,
  isUndefined,
  last,
  map,
  sortBy,
} from "lodash";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { ed25519 } from "@noble/curves/ed25519";
import {
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
  utf8ToBytes,
  randomBytes,
} from "@noble/ciphers/utils";
import moment from "moment";
import stringify from "fast-json-stable-stringify";
import axiosBackend from "../../../api/backend";
import { createClient } from "../../../database/supabase/clients/component";
import axios from "axios";

// Helper function to replace managedNonce functionality
function createCipherWithNonce(key: Uint8Array) {
  return {
    encrypt: (data: Uint8Array) => {
      const nonce = randomBytes(24); // XChaCha20-Poly1305 uses 24-byte nonce
      const encrypted = xchacha20poly1305(key, nonce).encrypt(data);
      // Prepend nonce to encrypted data
      const result = new Uint8Array(nonce.length + encrypted.length);
      result.set(nonce);
      result.set(encrypted, nonce.length);
      return result;
    },
    decrypt: (data: Uint8Array) => {
      const nonce = data.slice(0, 24);
      const encrypted = data.slice(24);
      return xchacha20poly1305(key, nonce).decrypt(encrypted);
    }
  };
}

class NoCurrentIdentity extends Error {
  constructor(...args) {
    super("There is no current Space Identity to use", ...args);
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

export type PreSpaceKeys = SpaceKeys & {
  type: "pre";
  timestamp: string;
};

interface PreKeyActions {
  createSignedFile: (
    data: string,
    fileType: string,
    options?: {
      fileName?: string;
    },
  ) => Promise<SignedFile>;
  createEncryptedSignedFile: (
    data: string,
    fileType: string,
    options?: {
      useRootKey?: boolean;
      fileName?: string;
    },
  ) => Promise<SignedFile>;
  decryptEncryptedSignedFile: (file: SignedFile) => Promise<string>;
  generatePreKey: () => Promise<PreSpaceKeys>;
  loadPreKeys: () => Promise<PreSpaceKeys[]>;
  getCurrentPrekey: () => PreSpaceKeys | undefined;
  addPreKeysToIdentity: (prekeys: PreSpaceKeys[]) => void;
}

export type PreKeyStore = PreKeyActions;

export const prekeyStore = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): PreKeyStore => ({
  createSignedFile: async (data, fileType, options) => {
    const currentIdentity = get().account.getCurrentIdentity();
    if (isUndefined(currentIdentity)) {
      throw new NoCurrentIdentity();
    }
    return signSignable(
      {
        fileData: data,
        fileType,
        publicKey: currentIdentity.rootKeys.publicKey,
        isEncrypted: false,
        timestamp: moment().toISOString(),
        fileName: options?.fileName,
      },
      currentIdentity.rootKeys.privateKey,
    );
  },
  createEncryptedSignedFile: async (data, fileType, options) => {
    const useRootKey = options?.useRootKey || false;
    const key = useRootKey
      ? get().account.getCurrentIdentity()!.rootKeys
      : get().account.getCurrentPrekey() ||
        (await get().account.generatePreKey());
    const cipher = createCipherWithNonce(
      stringToCipherKey(key.privateKey),
    );
    const file: UnsignedFile = {
      fileData: bytesToHex(cipher.encrypt(utf8ToBytes(data))),
      fileType,
      publicKey: key.publicKey,
      isEncrypted: true,
      timestamp: moment().toISOString(),
      fileName: options?.fileName,
    };
    return signSignable(file, key.privateKey);
  },
  decryptEncryptedSignedFile: async (file) => {
    if (!file.isEncrypted) {
      return file.fileData;
    }
    const encryptingKey = file.publicKey;
    let keyPair: SpaceKeys | undefined;
    if (encryptingKey === get().account.currentSpaceIdentityPublicKey) {
      keyPair = get().account.getCurrentIdentity()?.rootKeys;
    } else {
      // Find the pre key used to encrypt this file
      keyPair = find(get().account.getCurrentIdentity()?.preKeys, {
        publicKey: encryptingKey,
      });
      // Try loading keys from the DB if key is not found
      if (isUndefined(keyPair)) {
        const preKeys = await get().account.loadPreKeys();
        keyPair = find(preKeys, { publicKey: encryptingKey });
      }
    }
    // Error if key is still not found
    if (isUndefined(keyPair)) {
      throw new NoPreKeyFoundError(encryptingKey);
    }
    const cipher = createCipherWithNonce(
      stringToCipherKey(keyPair.privateKey),
    );
    return bytesToUtf8(cipher.decrypt(hexToBytes(file.fileData)));
  },
  generatePreKey: async () => {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);
    const prekey: PreSpaceKeys = {
      publicKey: bytesToHex(publicKey),
      privateKey: bytesToHex(privateKey),
      type: "pre",
      timestamp: moment().toISOString(),
    };
    const keyFile = await get().account.createEncryptedSignedFile(
      stringify(prekey),
      "json",
      { useRootKey: true },
    );
    const postData: PreKeyRequest = {
      file: keyFile,
      identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
      prekeyPublicKey: bytesToHex(publicKey),
    };

    // TO DO: Error handling
    await axiosBackend.post("/api/space/prekeys", postData, {
      headers: { "Content-Type": "application/json" },
    });

    get().account.addPreKeysToIdentity([prekey]);
    return prekey;
  },
  addPreKeysToIdentity: (prekeys) => {
    set((draft) => {
      const currentIdentityIndex = findIndex(get().account.spaceIdentities, {
        rootKeys: { publicKey: get().account.currentSpaceIdentityPublicKey },
      });
      draft.account.spaceIdentities[currentIdentityIndex].preKeys = sortBy(
        concat(
          draft.account.spaceIdentities[currentIdentityIndex].preKeys,
          prekeys,
        ),
        ["timestamp"],
      );
    }, "addPreKeysToIdentity");
  },
  loadPreKeys: async () => {
    const { data } = await axiosBackend.get<PreKeyResponse>(
      "/api/space/prekeys",
      {
        params: {
          publicKey: get().account.getCurrentIdentity()?.rootKeys.publicKey,
        },
      },
    );
    const keyFileLocs = data.value!;
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
              headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
              },
            });
            const fileData = JSON.parse(await data.text()) as SignedFile;
            const decryptedFile =
              await get().account.decryptEncryptedSignedFile(fileData);
            const preKeys = JSON.parse(decryptedFile) as PreSpaceKeys;
            return preKeys;
          } catch {
            return undefined;
          }
        }),
      ),
    );
    get().account.addPreKeysToIdentity(prekeys);
    return prekeys;
  },
  getCurrentPrekey: () => {
    return last(get().account.getCurrentIdentity()?.preKeys);
  },
});
