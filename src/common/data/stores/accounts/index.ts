import { StoreGet, StoreSet } from "../createStore";
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
  authenticatorDefaults,
  authenticatorStore,
  partializedAuthenticatorStore,
} from "./authenticatorStore";
import { SpaceStore, spaceDefault, spaceStore } from "./spaceStore";
import { FarcasterStore, farcasterStore } from "./farcasterStore";
import { AppStore } from "..";

export type AccountStore = IdentityStore &
  AuthenticatorStore &
  PreKeyStore &
  SpaceStore &
  FarcasterStore &
  PrivyStore & {
    logout: () => void;
  };

const accountStoreDefaults: Partial<AccountStore> = {
  ...privyDefault,
  ...identityDefault,
  ...spaceDefault,
  ...authenticatorDefaults,
};

export const createAccountStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
  state: AppStore,
): AccountStore => ({
  ...identityStore(set, get),
  ...prekeyStore(set, get),
  ...privyStore(set),
  ...authenticatorStore(set, get),
  ...farcasterStore(set, get),
  ...spaceStore(set, get),
  logout: () => {
    set((_draft) => {
      return rawReturn(accountStoreDefaults);
    });
  },
});

export const partializedAccountStore = (state: AppStore) => ({
  ...partializedIdentityStore(state),
  ...partializedPrivyStore(state),
  ...partializedAuthenticatorStore(state),
});
