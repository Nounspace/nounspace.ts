import { SignedFile, UnsignedFile, signFile } from "@/common/lib/signedFiles";
import { PreKeyRequest, PreKeyResponse } from "@/pages/api/space/prekeys";
import { SpaceKeys, stringToCipherKey } from "./indentityStore";
import { StoreGet, StoreSet } from "..";
import { AccountStore } from ".";
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
import { secp256k1 } from "@noble/curves/secp256k1";
import { managedNonce } from "@noble/ciphers/webcrypto";
import { bytesToHex, bytesToUtf8, utf8ToBytes } from "@noble/ciphers/utils";
import moment from "moment";
import stringify from "fast-json-stable-stringify";
import axiosBackend from "../../api/backend";
import { createClient } from "../../database/supabase/clients/component";
import axios from "axios";

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

export type PreKeyStore = PreKeyActions;

export const prekeyStore = (
  set: StoreSet<AccountStore>,
  get: StoreGet<AccountStore>,
): PreKeyStore => ({
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
    return last(get().getCurrentIdentity()?.preKeys);
  },
});
