import test from 'node:test';
import assert from 'node:assert/strict';
import { updateFidgetInstanceDatums } from '../src/fidgets/layout/updateFidgetInstanceDatums.js';

const initialDatums = {
  a: { id: 'a', fidgetType: 'foo', config: { settings: {}, editable: true, data: {} } },
  b: { id: 'b', fidgetType: 'bar', config: { settings: { color: 'red' }, editable: true, data: {} } },
};

const newConfig = { settings: { color: 'blue' }, editable: true, data: {} };

test('updateFidgetInstanceDatums only updates specified id', () => {
  const updated = updateFidgetInstanceDatums({ ...initialDatums }, 'b', newConfig);
  assert.deepStrictEqual(updated.a, initialDatums.a);
  assert.deepStrictEqual(updated.b.config, newConfig);
  assert.strictEqual(Object.keys(updated).length, 2);
});

test('updateFidgetInstanceDatums ignores missing id', () => {
  const updated = updateFidgetInstanceDatums({ ...initialDatums }, 'missing', newConfig);
  assert.deepStrictEqual(updated, { ...initialDatums });
});

test('add then edit retains id', () => {
  const store = {
    state: { homebase: { homebaseConfig: { fidgetInstanceDatums: { ...initialDatums } } } },
    getState() { return this.state; },
  };

  const saveFidgetInstanceDatums = (updater) => {
    const existing =
      store.getState().homebase.homebaseConfig?.fidgetInstanceDatums || {};
    const datums = typeof updater === 'function' ? updater(existing) : updater;
    store.state.homebase.homebaseConfig.fidgetInstanceDatums = datums;
  };

  const newDatum = { id: 'c', fidgetType: 'baz', config: { settings: {}, editable: true, data: {} } };

  // Add
  saveFidgetInstanceDatums((current) => ({ ...current, c: newDatum }));

  // Edit immediately
  saveFidgetInstanceDatums((current) => updateFidgetInstanceDatums(current, 'c', newConfig));

  assert.ok(store.getState().homebase.homebaseConfig.fidgetInstanceDatums.c);
});

test('pending save flushed before edit', () => {
  const store = {
    state: { homebase: { homebaseConfig: { fidgetInstanceDatums: { ...initialDatums } } } },
    getState() { return this.state; },
  };

  let pendingDatums;
  const debouncedSave = (updater) => {
    const existing = store.getState().homebase.homebaseConfig.fidgetInstanceDatums;
    pendingDatums = typeof updater === 'function' ? updater(existing) : updater;
  };

  const flushPendingSaves = () => {
    if (pendingDatums) {
      store.state.homebase.homebaseConfig.fidgetInstanceDatums = pendingDatums;
      pendingDatums = undefined;
    }
  };

  const saveFidgetInstanceDatums = (updater) => {
    const existing = store.getState().homebase.homebaseConfig.fidgetInstanceDatums;
    const datums = typeof updater === 'function' ? updater(existing) : updater;
    store.state.homebase.homebaseConfig.fidgetInstanceDatums = datums;
  };

  const newDatum = { id: 'c', fidgetType: 'baz', config: { settings: {}, editable: true, data: {} } };

  // Add but do not flush yet
  debouncedSave((current) => ({ ...current, c: newDatum }));

  // Simulate selectFidget calling flush before saving edits
  flushPendingSaves();

  saveFidgetInstanceDatums((current) => updateFidgetInstanceDatums(current, 'c', newConfig));

  assert.ok(store.getState().homebase.homebaseConfig.fidgetInstanceDatums.c);
  assert.deepStrictEqual(
    store.getState().homebase.homebaseConfig.fidgetInstanceDatums.c.config,
    newConfig,
  );
});
