import { StoreGet, StoreSet } from "../../createStore";
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
import { PreKeyStore, prekeyStore } from "./prekeyStore";
import {
  AuthenticatorStore,
  authenticatorDefaults,
  authenticatorStore,
  partializedAuthenticatorStore,
} from "./authenticatorStore";
import { FarcasterStore, farcasterStore } from "./farcasterStore";
import { AppStore } from "..";

export type AccountStore = IdentityStore &
  AuthenticatorStore &
  PreKeyStore &
  FarcasterStore &
  PrivyStore & {
    reset: () => void;
    hasNogs: boolean;
    setHasNogs: (v: boolean) => void;
  };

export const accountStoreDefaults: Partial<AccountStore> = {
  ...privyDefault,
  ...identityDefault,
  ...authenticatorDefaults,
};

export const createAccountStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
  _state: AppStore,
): AccountStore => ({
  ...identityStore(set, get),
  ...prekeyStore(set, get),
  ...privyStore(set),
  ...authenticatorStore(set, get),
  ...farcasterStore(set, get),
  reset: () => {
    get().account.resetIdenities();
    get().account.resetAuthenticators();
    set((draft) => {
      draft.account.hasNogs = false;
    }, "resetHasNogs");
  },
  hasNogs: false,
  setHasNogs: (newValue) => {
    set((draft) => {
      draft.account.hasNogs = newValue;
    }, "setHasNogs");
  },
});

export const partializedAccountStore = (state: AppStore) => ({
  ...partializedIdentityStore(state),
  ...partializedPrivyStore(state),
  ...partializedAuthenticatorStore(state),
  hasNogs: state.account.hasNogs,
});
