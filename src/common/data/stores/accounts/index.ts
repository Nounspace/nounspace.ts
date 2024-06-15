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
import {
  AuthenticatorStore,
  authenticatorStore,
  partializedAuthenticatorStore,
} from "./authenticatorStore";
import { SpaceStore, spaceDefault } from "./spaceStore";

export type AccountStore = IdentityStore &
  AuthenticatorStore &
  PreKeyStore &
  SpaceStore &
  PrivyStore & {
    logout: () => void;
  };

const accountStoreDefaults: Partial<AccountStore> = {
  ...privyDefault,
  ...identityDefault,
  ...spaceDefault,
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
        ...partializedAuthenticatorStore(state),
      }),
    },
  );
}

const { useStore: useAccountStore, provider: AccountStoreProvider } =
  createStoreBindings("AcccountStore", createAccountStore);

export { useAccountStore, AccountStoreProvider };
