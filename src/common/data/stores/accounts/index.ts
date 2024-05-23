import { createJSONStorage } from "zustand/middleware";
import { StoreGet, StoreSet, createStore, createStoreBindings } from "..";
import { IdentityStore, indentityStore, partializedIdentityStore } from "./indentityStore";
import { PrivyStore, partializedPrivyStore, privyStore, useSignMessage } from "./privyStore";
import { blake3 } from '@noble/hashes/blake3';
import stringify from "fast-json-stable-stringify";

export interface UnsignedFile {
  publicKey: string;
  fileData: string;
  fileType: string;
  isEncrypted: boolean;
}

export type SignedFile = UnsignedFile & {
  signature: string;
}

export function hashObject(obj: object) {
  return blake3(stringify(obj), { dkLen: 256 });
}

export type AccountStore = IdentityStore & PrivyStore;

function createAccountStore() {
  return createStore<AccountStore>(
    (set: StoreSet<AccountStore>, get: StoreGet<AccountStore>, _state: AccountStore) => ({
      ...indentityStore(set, get),
      ...privyStore(set),
    }),
    {
      name: "nounspace-account-store",
      storage: createJSONStorage(() => sessionStorage), 
      partialize: (state: AccountStore) => ({
        ...partializedIdentityStore(state),
        ...partializedPrivyStore(state),
      }),
    }
  )
}

const { useStore: useAccountStore, provider: AccountStoreProvider } = createStoreBindings("AcccountStore", createAccountStore);

export {
  useAccountStore, AccountStoreProvider,
};
