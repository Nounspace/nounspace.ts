import test from 'node:test';
import assert from 'node:assert/strict';

// simplified clone helper
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Mock implementation of loadHomebaseTab based on src/common/data/stores/app/homebase/homebaseTabsStore.ts
async function loadHomebaseTab(store, tabName, fetchedConfig) {
  if (!Object.prototype.hasOwnProperty.call(store.homebase.tabs, tabName)) return;

  const spaceConfig = fetchedConfig;

  const tabState = store.homebase.tabs[tabName];
  tabState.remoteConfig = clone(spaceConfig);
  if (tabState.config === undefined) {
    tabState.config = clone(spaceConfig);
  }

  return spaceConfig;
}

test('loadHomebaseTab does not overwrite existing config', async () => {
  const existingConfig = { layout: 'local' };
  const remoteConfig = { layout: 'remote' };

  const store = {
    homebase: {
      tabs: {
        demo: { config: clone(existingConfig) },
      },
    },
  };

  await loadHomebaseTab(store, 'demo', remoteConfig);

  assert.deepStrictEqual(store.homebase.tabs.demo.config, existingConfig);
  assert.deepStrictEqual(store.homebase.tabs.demo.remoteConfig, remoteConfig);
});
