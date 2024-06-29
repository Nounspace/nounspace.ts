import { rawReturn } from "mutative";
import { createJSONStorage } from "zustand/middleware";
import { createStore, createStoreBindings } from "../createStore";
import {
  AccountStore,
  createAccountStoreFunc,
  partializedAccountStore,
} from "./accounts";
import { SetupStep, SetupStore, createSetupStoreFunc } from "./setup";
import { isUndefined, merge } from "lodash";
import {
  HomeBaseStore,
  createHomeBaseStoreFunc,
  partializedHomebaseStore,
} from "./homebase";
import {
  createSpaceStoreFunc,
  partializedSpaceStore,
  SpaceStore,
} from "./space/spaceStore";
import { usePrivy } from "@privy-io/react-auth";

export type AppStore = {
  account: AccountStore;
  setup: SetupStore;
  homebase: HomeBaseStore;
  space: SpaceStore;
  logout: () => void;
  getIsAccountReady: () => boolean;
};

const makeStoreFunc = (set, get, state): AppStore => ({
  setup: createSetupStoreFunc(set, get),
  account: createAccountStoreFunc(set, get, state),
  homebase: createHomeBaseStoreFunc(set, get),
  space: createSpaceStoreFunc(set, get),
  logout: () => {
    set((_draft) => {
      return rawReturn({
        ...makeStoreFunc(set, get, state),
        isLoggingOut: true,
      });
    }, "logout");
  },
  getIsAccountReady: () => {
    return (
      get().setup.currentStep === SetupStep.DONE &&
      !isUndefined(get().account.getCurrentIdentity())
    );
  },
});

export function createAppStore() {
  return createStore<AppStore>(makeStoreFunc, {
    name: "nounspace-app-store",
    storage: createJSONStorage(() => localStorage),
    partialize: (state: AppStore) => ({
      account: partializedAccountStore(state),
      homebase: partializedHomebaseStore(state),
      space: partializedSpaceStore(state),
    }),
    merge: (persistedState, currentState: AppStore) => {
      return merge(currentState, persistedState);
    },
  });
}

const { useStore: useAppStore, provider: AppStoreProvider } =
  createStoreBindings<AppStore>("AppStore", createAppStore);

function useLogout() {
  const { logout: privyLogout, authenticated } = usePrivy();
  const { storeLogout } = useAppStore((state) => ({
    storeLogout: state.logout,
  }));

  async function logout() {
    if (authenticated) await privyLogout();
    storeLogout();
  }

  return logout;
}

export { useAppStore, AppStoreProvider, useLogout };
