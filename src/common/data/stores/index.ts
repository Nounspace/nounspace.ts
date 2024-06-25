import { rawReturn } from "mutative";
import { createJSONStorage } from "zustand/middleware";
import { createStore, createStoreBindings } from "./createStore";
import {
  AccountStore,
  accountStoreDefaults,
  createAccountStoreFunc,
  partializedAccountStore,
} from "./accounts";
import { SetupStore, createSetupStoreFunc, setupStoreDefaults } from "./setup";
import { merge } from "lodash";
import {
  HomeBaseStore,
  homeBaseStoreDefaults,
  createHomeBaseStoreFunc,
  partializedHomebaseStore,
} from "./homebase";
import {
  createSpaceStoreFunc,
  partializedSpaceStore,
  SpaceStore,
  spaceStoreDefaults,
} from "./space/spaceStore";

export type AppStore = {
  account: AccountStore;
  setup: SetupStore;
  homebase: HomeBaseStore;
  space: SpaceStore;
  logout: () => void;
};

export function createAppStore() {
  return createStore<AppStore>(
    (set, get, state) => ({
      setup: createSetupStoreFunc(set, get),
      account: createAccountStoreFunc(set, get, state),
      homebase: createHomeBaseStoreFunc(set, get),
      space: createSpaceStoreFunc(set, get),
      logout: () => {
        set((_draft) => {
          return rawReturn({
            account: accountStoreDefaults,
            setup: setupStoreDefaults,
            homebase: homeBaseStoreDefaults,
            space: spaceStoreDefaults,
          });
        });
      },
    }),
    {
      name: "nounspace-setup-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: AppStore) => ({
        account: partializedAccountStore(state),
        homebase: partializedHomebaseStore(state),
        space: partializedSpaceStore(state),
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
