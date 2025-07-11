"use client";
import { createJSONStorage } from "zustand/middleware";
import {
  createStore,
  createStoreBindings,
  MatativeConfig,
} from "../createStore";
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
} from "./homebase/homebaseStore";
import {
  createSpaceStoreFunc,
  partializedSpaceStore,
  SpaceStore,
} from "./space/spaceStore";
import {
  CheckpointStore,
  createCheckpointStoreFunc,
  partializedCheckpointStore,
} from "./checkpoints/checkpointStore";
import {
  ChatStore,
  createChatStoreFunc,
  partializedChatStore,
} from "./chat/chatStore";
import { usePrivy } from "@privy-io/react-auth";
import { createCurrentSpaceStoreFunc, CurrentSpaceStore } from "./currentSpace";

export type AppStore = {
  account: AccountStore;
  setup: SetupStore;
  homebase: HomeBaseStore;
  space: SpaceStore;
  currentSpace: CurrentSpaceStore;
  checkpoints: CheckpointStore;
  chat: ChatStore;
  logout: () => void;
  getIsAccountReady: () => boolean;
  getIsInitializing: () => boolean;
  clearLocalSpaces: () => void; 
};

const LOCAL_STORAGE_LOCATION = "nounspace-app-store";

const makeStoreFunc: MatativeConfig<AppStore> = (set, get, state) => ({
  setup: createSetupStoreFunc(set, get),
  account: createAccountStoreFunc(set, get, state),
  homebase: createHomeBaseStoreFunc(set, get),
  space: createSpaceStoreFunc(set, get),
  currentSpace: createCurrentSpaceStoreFunc(set, get),
  checkpoints: createCheckpointStoreFunc(set, get),
  chat: createChatStoreFunc(set, get),
  logout: () => {
    get().account.reset();
    get().homebase.clearHomebase();
    get().homebase.clearHomebaseTabOrder();
    get().space.clear();
    get().checkpoints.clearCheckpoints();
    get().chat.clearMessages();
    localStorage.removeItem(LOCAL_STORAGE_LOCATION);
  },
  clearLocalSpaces: () => {
    // remove only the space slice while keeping the rest of the persisted data
    get().space.clear();
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_LOCATION);
      if (raw) {
        const persisted = JSON.parse(raw);
        delete persisted.space;
        localStorage.setItem(LOCAL_STORAGE_LOCATION, JSON.stringify(persisted));
      }
    } catch { /* fall back silently – corruption handled on next hydrate */ }
  },
  getIsAccountReady: () => {
    return (
      get().setup.currentStep === SetupStep.DONE &&
      !isUndefined(get().account.getCurrentIdentity())
    );
  },
  getIsInitializing: () => {
    const currentStep = get().setup.currentStep;
    return (
      currentStep !== SetupStep.NOT_SIGNED_IN && currentStep !== SetupStep.DONE
    );
  },
});

export function createAppStore() {
  return createStore<AppStore>(makeStoreFunc, {
    name: LOCAL_STORAGE_LOCATION,
    storage: createJSONStorage(() => localStorage),
    partialize: (state: AppStore) => ({
      account: partializedAccountStore(state),
      homebase: partializedHomebaseStore(state),
      space: partializedSpaceStore(state),
      checkpoints: partializedCheckpointStore(state),
      chat: partializedChatStore(state),
    }),
    merge: (persistedState, currentState: AppStore) => {
      return merge(currentState, persistedState);
    },
  });
}

const { useStore: useAppStore, provider: AppStoreProvider } =
  createStoreBindings<AppStore>("AppStore", createAppStore);

function useLogout() {
  const { logout: privyLogout } = usePrivy();
  const { storeLogout } = useAppStore((state) => ({
    storeLogout: state.logout,
  }));

  async function logout() {
    await privyLogout();
    storeLogout();
  }

  return logout;
}

export { useAppStore, AppStoreProvider, useLogout };
