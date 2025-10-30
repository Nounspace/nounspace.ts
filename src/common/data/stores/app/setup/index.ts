import {
  createSetterFunction,
  SetterFunction,
  StoreGet,
  StoreSet,
} from "../../createStore";
import { AppStore } from "..";

export enum SetupStep {
  UNINITIALIZED = "Uninitialized",
  NOT_SIGNED_IN = "Please Sign in with Privy",
  SIGNED_IN = "Connecting to wallet...",
  WALLET_CONNECTED = "Preparing your account...",
  TOKENS_FOUND = "Loading Identity...",
  IDENTITY_LOADED = "Loading Authenticators...",
  AUTHENTICATORS_LOADED = "Installing required Authenticators...",
  REQUIRED_AUTHENTICATORS_INSTALLED = "Initializing Authenicators...",
  AUTHENTICATORS_INITIALIZED = "Registering accounts...",
  ACCOUNTS_REGISTERED = "Loading...",
  DONE = "DONE",
}

export const RECHECK_BACKOFF_FACTOR = 2;
export const RECHECK_INITIAL_TIME = 10000; // ten seconds

interface SetupStoreState {
  currentStep: SetupStep;
  modalOpen: boolean;
  keepModalOpen: boolean;
  // nogs
  nogsRecheckTimerLength: number; // How long to reque for (ms)
  nogsTimeoutTimer: ReturnType<typeof setTimeout> | undefined;
  nogsIsChecking: boolean;
  nogsRecheckCountDown: number; // How long until next recheck (seconds)
  nogsRecheckCountDownTimer: ReturnType<typeof setTimeout> | undefined;
  nogsShouldRecheck: boolean;
  // wallet signatures
  isRequestingWalletSignature: boolean;
}

interface SetupStoreActions {
  setCurrentStep: (step: SetupStep) => void;
  setModalOpen: SetterFunction<boolean>;
  setKeepModalOpen: SetterFunction<boolean>;
  setNogsRecheckTimerLength: SetterFunction<number>;
  setNogsIsChecking: SetterFunction<boolean>;
  setNogsShouldRecheck: SetterFunction<boolean>;
  setNogsRecheckCountDown: SetterFunction<number>;
  setNogsRecheckCountDownTimer: SetterFunction<
    ReturnType<typeof setTimeout> | undefined
  >;
  setNogsTimeoutTimer: SetterFunction<
    ReturnType<typeof setTimeout> | undefined
  >;
  setIsRequestingWalletSignature: SetterFunction<boolean>;
}

export type SetupStore = SetupStoreState & SetupStoreActions;

export const setupStoreDefaults: SetupStoreState = {
  currentStep: SetupStep.UNINITIALIZED,
  modalOpen: false,
  keepModalOpen: false,
  // nogs
  nogsRecheckTimerLength: RECHECK_INITIAL_TIME,
  nogsIsChecking: false,
  nogsShouldRecheck: false,
  nogsRecheckCountDown: 0,
  nogsTimeoutTimer: undefined,
  nogsRecheckCountDownTimer: undefined,
  // wallet signatures
  isRequestingWalletSignature: false,
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
  setNogsRecheckTimerLength: createSetterFunction(
    "setup.nogsRecheckTimerLength",
    "setNogsRecheckTimerLength",
    set,
  ),
  setNogsIsChecking: createSetterFunction(
    "setup.nogsIsChecking",
    "setNogsIsChecking",
    set,
  ),
  setNogsShouldRecheck: createSetterFunction(
    "setup.nogsShouldRecheck",
    "setNogsShouldRecheck",
    set,
  ),
  setNogsRecheckCountDown: createSetterFunction(
    "setup.nogsRecheckCountDown",
    "setNogsRecheckCountDown",
    set,
  ),
  setNogsRecheckCountDownTimer: createSetterFunction(
    "setup.nogsRecheckCountDownTimer",
    "setNogsRecheckCountDownTimer",
    set,
  ),
  setNogsTimeoutTimer: createSetterFunction(
    "setup.nogsTimeoutTimer",
    "setNogsTimeoutTimer",
    set,
  ),
  setIsRequestingWalletSignature: createSetterFunction(
    "setup.isRequestingWalletSignature",
    "setIsRequestingWalletSignature",
    set,
  ),
});
