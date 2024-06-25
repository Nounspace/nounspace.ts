import { StoreGet, StoreSet } from "../createStore";
import { AppStore } from "..";

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
});
