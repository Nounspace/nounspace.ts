import { createJSONStorage } from "zustand/middleware";
import { createStore, createStoreBindings } from "./createStore";
import {
  AccountStore,
  createAccountStoreFunc,
  partializedAccountStore,
} from "./accounts";
import { SetupStore, createSetupStoreFunc } from "./setup";
import { merge } from "lodash";
import {
  HomeBaseStore,
  createHomeBaseStoreFunc,
  partializedHomebaseStore,
} from "./homebase";

export type AppStore = {
  account: AccountStore;
  setup: SetupStore;
  homebase: HomeBaseStore;
};

export function createAppStore() {
  return createStore<AppStore>(
    (set, get, state) => ({
      setup: createSetupStoreFunc(set, get),
      account: createAccountStoreFunc(set, get, state),
      homebase: createHomeBaseStoreFunc(set, get),
    }),
    {
      name: "nounspace-setup-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state: AppStore) => ({
        account: partializedAccountStore(state),
        homebase: partializedHomebaseStore(state),
      }),
      merge: (persistedState, currentState: AppStore) => {
        return merge(currentState, persistedState);
      },
    },
  );
}

const { useStore: useAppStore, provider: AppStoreProvider } =
  createStoreBindings<AppStore>("AppStore", createAppStore);

export { useAppStore, AppStoreProvider };
