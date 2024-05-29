import { createJSONStorage } from "zustand/middleware";
import { StoreGet, StoreSet, createStore, createStoreBindings } from "..";
import { IdentityStore, identityDefault, indentityStore, partializedIdentityStore } from "./indentityStore";
import { PrivyStore, partializedPrivyStore, privyDefault, privyStore } from "./privyStore";
import { blake3 } from '@noble/hashes/blake3';
import stringify from "fast-json-stable-stringify";
import { rawReturn } from "mutative";

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

export type AccountStore = IdentityStore & PrivyStore & {
  logout: () => void;
};

const accountStoreDefaults: Partial<AccountStore> = {
  ...privyDefault,
  ...identityDefault,
};

function createAccountStore() {
  return createStore<AccountStore>(
    (set: StoreSet<AccountStore>, get: StoreGet<AccountStore>, state: AccountStore) => ({
      ...indentityStore(set, get),
      ...privyStore(set),
      logout: () => {
        set((_draft) => {
          return rawReturn(accountStoreDefaults);
        });
      },
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

const { useStore: useAccountStore, provider: AccountStoreProvider } = createStoreBindings(
  "AcccountStore",
  createAccountStore,
);

export {
  useAccountStore, AccountStoreProvider,
};
