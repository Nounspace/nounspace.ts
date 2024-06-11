import { createJSONStorage } from "zustand/middleware";
import { StoreGet, StoreSet, createStore, createStoreBindings } from "..";
import {
  IdentityStore,
  identityDefault,
  identityStore,
  partializedIdentityStore,
} from "./identityStore";
import {
  PrivyStore,
  partializedPrivyStore,
  privyDefault,
  privyStore,
} from "./privyStore";
import { rawReturn } from "mutative";
import { PreKeyStore, prekeyStore } from "./prekeyStore";
import { AuthenticatorStore, authenticatorStore } from "./authenticatorStore";

export type AccountStore = IdentityStore &
  AuthenticatorStore &
  PreKeyStore &
  PrivyStore & {
    logout: () => void;
  };

const accountStoreDefaults: Partial<AccountStore> = {
  ...privyDefault,
  ...identityDefault,
};

function createAccountStore() {
  return createStore<AccountStore>(
    (
      set: StoreSet<AccountStore>,
      get: StoreGet<AccountStore>,
      state: AccountStore,
    ) => ({
      ...identityStore(set, get),
      ...prekeyStore(set, get),
      ...privyStore(set),
      ...authenticatorStore(set, get),
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
    },
  );
}

const { useStore: useAccountStore, provider: AccountStoreProvider } =
  createStoreBindings("AcccountStore", createAccountStore);

export { useAccountStore, AccountStoreProvider };
