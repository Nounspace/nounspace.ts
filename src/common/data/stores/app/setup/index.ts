import { SetterFunction, StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import { ReactNode } from "react";

export enum SetupStep {
  START = "Connecting to wallet...",
  WALLET_CONNECTED = "Loading Identity...",
  IDENTITY_LOADED = "Loading Authenticators...",
  AUTHENTICATORS_LOADED = "Installing required Authenticators...",
  REQUIRED_AUTHENTICATORS_INSTALLED = "Initializing Authenicators...",
  AUTHENTICATORS_INITIALIZED = "Registering accounts...",
  ACCOUNTS_REGISTERED = "Loading...",
  DONE = "DONE",
}

interface SetupStoreState {
  currentStep: SetupStep;
}

interface SetupStoreActions {
  setCurrentStep: (step: SetupStep) => void;
  modalContent: ReactNode | undefined;
  setModalContent: SetterFunction<ReactNode | undefined>;
  modalOpen: boolean;
  setModalOpen: SetterFunction<boolean>;
  keepModalOpen: boolean;
  setKeepModalOpen: SetterFunction<boolean>;
}

export type SetupStore = SetupStoreState & SetupStoreActions;

export const setupStoreDefaults: SetupStoreState = {
  currentStep: SetupStep.START,
};

export const createSetupStoreFunc = (
  set: StoreSet<AppStore>,
  _get: StoreGet<AppStore>,
): SetupStore => ({
  ...setupStoreDefaults,
  setCurrentStep: (step) => {
    set((draft) => {
      draft.setup.currentStep = step;
    });
  },
  modalContent: undefined,
  setModalContent: (content) =>
    set((draft) => (draft.setup.modalContent = content)),
  modalOpen: false,
  setModalOpen: (val) =>
    set((draft) => (draft.setup.modalOpen = val || draft.setup.keepModalOpen)),
  keepModalOpen: false,
  setKeepModalOpen: (val) => set((draft) => (draft.setup.keepModalOpen = val)),
});
