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
