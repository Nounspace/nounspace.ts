import { SetterFunction, StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";

export enum SetupStep {
  NOT_SIGNED_IN = "Please Sign in with Privy",
  SIGNED_IN = "Connecting to wallet...",
  WALLET_CONNECTED = "Checking for nOGs...",
  TOKENS_FOUND = "Loading Identity...",
  IDENTITY_LOADED = "Loading Authenticators...",
  AUTHENTICATORS_LOADED = "Installing required Authenticators...",
  REQUIRED_AUTHENTICATORS_INSTALLED = "Initializing Authenicators...",
  AUTHENTICATORS_INITIALIZED = "Registering accounts...",
  ACCOUNTS_REGISTERED = "Loading...",
  DONE = "DONE",
}

interface SetupStoreState {
  currentStep: SetupStep;
  modalOpen: boolean;
  keepModalOpen: boolean;
}

interface SetupStoreActions {
  setCurrentStep: (step: SetupStep) => void;
  setModalOpen: SetterFunction<boolean>;
  setKeepModalOpen: SetterFunction<boolean>;
}

export type SetupStore = SetupStoreState & SetupStoreActions;

export const setupStoreDefaults: SetupStoreState = {
  currentStep: SetupStep.NOT_SIGNED_IN,
  modalOpen: false,
  keepModalOpen: false,
};

export const createSetupStoreFunc = (
  set: StoreSet<AppStore>,
  _get: StoreGet<AppStore>,
): SetupStore => ({
  ...setupStoreDefaults,
  setCurrentStep: (step) => {
    set((draft) => {
      draft.setup.currentStep = step;
    }, "setCurrentStep");
  },
  setModalOpen: (val) =>
    set((draft) => {
      draft.setup.modalOpen = val || draft.setup.keepModalOpen;
    }, "setModalOpen"),
  setKeepModalOpen: (val) =>
    set((draft) => {
      draft.setup.keepModalOpen = val;
    }, "setKeepModalOpen"),
});
