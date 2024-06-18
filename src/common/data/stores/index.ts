import { createJSONStorage } from "zustand/middleware";
import { createStore, createStoreBindings } from "./createStore";
import {
  AccountStore,
  createAccountStoreFunc,
  partializedAccountStore,
} from "./accounts";
import { SetupStore, createSetupStoreFunc } from "./setup";

export type AppStore = {
  account: AccountStore;
  setup: SetupStore;
};

export function createAppStore() {
  return createStore<AppStore>(
    (set, get, state) => ({
      setup: createSetupStoreFunc(set, get, state),
      account: createAccountStoreFunc(set, get, state),
    }),
    {
      name: "nounspace-setup-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state: AppStore) => ({
        account: partializedAccountStore(state),
      }),
    },
  );
}

const { useStore: useAppStore, provider: AppStoreProvider } =
  createStoreBindings<AppStore>("AppStore", createAppStore);

export { useAppStore, AppStoreProvider };
