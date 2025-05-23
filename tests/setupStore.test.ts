import { describe, it, expect, beforeEach } from 'vitest';
import { createSetupStoreFunc, setupStoreDefaults, SetupStep, SetupStore } from '@/common/data/stores/app/setup';
import { StoreSet, StoreGet } from '@/common/data/stores/createStore';
import type { AppStore } from '@/common/data/stores/app';

describe('setup store', () => {
  let state: AppStore;
  let store: SetupStore;

  beforeEach(() => {
    state = { setup: { ...setupStoreDefaults } } as unknown as AppStore;
    const set: StoreSet<AppStore> = (fn) => {
      (fn as any)(state as any);
    };
    const get: StoreGet<AppStore> = () => state;
    store = createSetupStoreFunc(set, get);
  });

  it('updates currentStep', () => {
    store.setCurrentStep(SetupStep.SIGNED_IN);
    expect(state.setup.currentStep).toBe(SetupStep.SIGNED_IN);
  });

  it('modal respects keepModalOpen', () => {
    store.setKeepModalOpen(true);
    store.setModalOpen(false);
    expect(state.setup.modalOpen).toBe(true);
  });
});
