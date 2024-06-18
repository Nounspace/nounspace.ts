import { StoreGet, StoreSet } from "../createStore";
import { AppStore } from "..";

export enum SetupStep {
  START,
  IDENTITY_LOADED,
  AUTHENTICATORS_LOADED,
  REQUIRED_AUTHENTICATORS_INSTALLED,
  ACCOUNTS_REGISTERED,
  DONE,
}

interface SetupStoreState {
  currentStep: SetupStep;
}

interface SetupStoreActions {
  setCurrentStep: (step: SetupStep) => void;
}

export type SetupStore = SetupStoreState & SetupStoreActions;

const setupStoreDefaults: SetupStoreState = {
  currentStep: SetupStep.START,
};

export const createSetupStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): SetupStore => ({
  ...setupStoreDefaults,
  setCurrentStep: (step) => {
    set((draft) => {
      draft.setup.currentStep = step;
    });
  },
});
