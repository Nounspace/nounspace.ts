import {
  SpaceConfig,
  SpaceConfigSaveDetails,
} from "@/app/(spaces)/Space";
import axiosBackend from "@/common/data/api/backend";
import { createClient } from "@/common/data/database/supabase/clients/component";
import { SignedFile, signSignable } from "@/common/lib/signedFiles";
import INITIAL_HOMEBASE_CONFIG from "@/constants/initialHomebase";
import { homebaseTabOrderPath, homebaseTabsPath } from "@/constants/supabase";
import {
  ManageHomebaseTabsResponse,
  UnsignedManageHomebaseTabsRequest,
} from "@/pages/api/space/homebase/tabs";
import axios from "axios";
import stringify from "fast-json-stable-stringify";
import {
  clone,
  cloneDeep,
  debounce,
  forEach,
  has,
  isArray,
  mergeWith,
} from "lodash";
import moment from "moment";
import { AppStore } from "..";
import { StoreGet, StoreSet } from "../../createStore";
import {
  validateTabName,
  isDuplicateTabName,
  withOptimisticUpdate,
} from "@/common/utils/tabUtils";

// Default tab for homebase
export const HOMEBASE_DEFAULT_TAB = "Feed";

interface HomeBaseTabStoreState {
  tabs: {
    [tabName: string]: {
      config?: SpaceConfig;
      remoteConfig?: SpaceConfig;
    };
  };
  tabOrdering: {
    local: string[];
    remote: string[];
  };
}

interface HomeBaseTabStoreActions {
  loadTabNames: () => Promise<string[]>;
  loadTabOrdering: () => Promise<string[]>;
  updateTabOrdering: (newOrdering: string[], commit?: boolean) => void;
  commitTabOrderingToDatabase: () => Promise<void> | undefined;
  renameTab: (tabName: string, newName: string) => Promise<void>;
  deleteTab: (tabName: string) => Promise<void>;
  createTab: (tabName: string) => Promise<void>;
  loadHomebaseTab: (tabName: string) => Promise<SpaceConfig | undefined>;
  commitHomebaseTabToDatabase: (tabName: string) => Promise<void> | undefined;
  saveHomebaseTabConfig: (
    tabName: string,
    config: SpaceConfigSaveDetails,
  ) => Promise<void>;
  resetHomebaseTabConfig: (tabName: string) => Promise<void>;
  clearHomebaseTabs: () => void;
}

export type HomeBaseTabStore = HomeBaseTabStoreState & HomeBaseTabStoreActions;

export const homeBaseStoreDefaults: HomeBaseTabStoreState = {
  tabs: {},
  tabOrdering: {
    local: [],
    remote: [],
  },
};

export const createHomeBaseTabStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): HomeBaseTabStore => ({
  ...homeBaseStoreDefaults,
  updateTabOrdering(newOrdering, commit = false) {
    set((draft) => {
      draft.homebase.tabOrdering.local = newOrdering;
    }, "updateTabOrdering");
    if (commit) {
      get().homebase.commitTabOrderingToDatabase();
    }
  },
  async loadTabOrdering() {
    // console.log('Loading tab ordering...');
    const supabase = createClient();
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("private")
      .getPublicUrl(
        `${homebaseTabOrderPath(get().account.currentSpaceIdentityPublicKey!)}`,
      );
    try {
      const t = Math.random().toString(36).substring(2);
      const urlWithParam = `${publicUrl}?t=${t}`;

      const { data } = await axios.get<Blob>(urlWithParam, {
        responseType: "blob",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const fileData = JSON.parse(await data.text()) as SignedFile;
      const tabOrder = JSON.parse(
        await get().account.decryptEncryptedSignedFile(fileData),
      ) as string[];
      
      // console.log('Loaded tab ordering:', {
      //   tabCount: tabOrder.length,
      //   tabs: tabOrder
      // });
      
      set((draft) => {
        // Ensure default tab is always first in the loaded order
        const orderedTabs = clone(tabOrder);
        if (!orderedTabs.includes(HOMEBASE_DEFAULT_TAB)) {
          orderedTabs.unshift(HOMEBASE_DEFAULT_TAB);
        } else {
          // If default tab exists but isn't first, move it to the front
          const defaultTabIndex = orderedTabs.indexOf(HOMEBASE_DEFAULT_TAB);
          if (defaultTabIndex > 0) {
            orderedTabs.splice(defaultTabIndex, 1);
            orderedTabs.unshift(HOMEBASE_DEFAULT_TAB);
          }
        }
        
        draft.homebase.tabOrdering = {
          local: orderedTabs,
          remote: clone(tabOrder),
        };
      }, `loadHomebaseTabOrdering`);
      return tabOrder;
    } catch (e) {
      // console.log('Failed to load tab ordering, using empty array');
      return [];
    }
  },
  commitTabOrderingToDatabase: debounce(async () => {
    const localCopy = cloneDeep(
      get().homebase.tabOrdering.local.filter((name, i, arr) =>
        arr.indexOf(name) === i,
      ),
    );
    if (localCopy) {
      // console.log('Committing tab ordering to database:', {
      //   tabCount: localCopy.length,
      //   tabs: localCopy
      // });
      
      const file = await get().account.createEncryptedSignedFile(
        stringify(localCopy),
        "json",
        { useRootKey: true },
      );
      try {
        await axiosBackend.post(`/api/space/homebase/tabOrder`, file);
        set((draft) => {
          draft.homebase.tabOrdering.remote = localCopy;
        }, "commitHomebaseTabOrderToDatabase");
      } catch (e) {
        console.error('Failed to commit tab ordering:', e);
        throw e;
      }
    }
  }, 1000),
  async loadTabNames() {
    // console.log('Loading tab names...');
    try {
      const { data } = await axiosBackend.get<ManageHomebaseTabsResponse>(
        "/api/space/homebase/tabs",
        {
          params: {
            identityPublicKey: get().account.currentSpaceIdentityPublicKey,
          },
        },
      );
      if (data.result === "error") {
        // console.log('Failed to load tab names, using empty array');
        return [];
      } else {
        const validTabNames = data.value || [];
        
        // console.log('Loaded tab names:', {
        //   tabCount: validTabNames.length,
        //   tabs: validTabNames
        // });
        
        set((draft) => {
          // Don't wipe tabs object - instead, preserve existing tabs and only modify what's needed
          const validTabNames = data.value || [];
          const currentTabNames = Object.keys(draft.homebase.tabs);
          
          // Remove tabs that no longer exist in the remote list
          currentTabNames.forEach(tabName => {
            if (!validTabNames.includes(tabName)) {
              delete draft.homebase.tabs[tabName];
            }
          });
          
          // Add entries for any new tabs that don't exist locally yet
          validTabNames.forEach((tabName) => {
            if (!draft.homebase.tabs[tabName]) {
              draft.homebase.tabs[tabName] = {};
            }
          });

          // Clean up tab order by removing tabs that no longer exist
          draft.homebase.tabOrdering.local = draft.homebase.tabOrdering.local.filter(
            tabName => validTabNames.includes(tabName)
          );

          // Ensure default tab is always first in the order
          if (!draft.homebase.tabOrdering.local.includes(HOMEBASE_DEFAULT_TAB)) {
            draft.homebase.tabOrdering.local.unshift(HOMEBASE_DEFAULT_TAB);
          } else {
            // If default tab exists but isn't first, move it to the front
            const defaultTabIndex = draft.homebase.tabOrdering.local.indexOf(HOMEBASE_DEFAULT_TAB);
            if (defaultTabIndex > 0) {
              draft.homebase.tabOrdering.local.splice(defaultTabIndex, 1);
              draft.homebase.tabOrdering.local.unshift(HOMEBASE_DEFAULT_TAB);
            }
          }

          // Add back any other valid tabs that aren't in the tab order
          validTabNames.forEach(tabName => {
            if (tabName !== HOMEBASE_DEFAULT_TAB && !draft.homebase.tabOrdering.local.includes(tabName)) {
              draft.homebase.tabOrdering.local.push(tabName);
            }
          });
        }, "loadTabNames");

        // Load remote state for any tabs that don't have it. Don't block on
        // these network requests so the feed can render quickly.
        validTabNames.forEach((tabName) => {
          if (!get().homebase.tabs[tabName]?.remoteConfig) {
            void get().homebase.loadHomebaseTab(tabName);
          }
        });

        return validTabNames;
      }
    } catch (e) {
      // console.debug("failed to load tab names", e);
      return [];
    }
  },
  async createTab(tabName) {
    // console.log('Creating new tab:', { tabName });
    const publicKey = get().account.currentSpaceIdentityPublicKey;
    if (!publicKey) return;

    // Validate the tab name before proceeding
    const validationError = validateTabName(tabName);
    if (validationError) {
      throw new Error(validationError);
    }

    // Check if tab already exists
    if (get().homebase.tabs[tabName]) {
      // console.log('Tab already exists:', { tabName });
      // If tab exists but doesn't have remote state, load it
      if (!get().homebase.tabs[tabName]?.remoteConfig) {
        await get().homebase.loadHomebaseTab(tabName);
      }

      // Add it back to the tab order if it's not already there
      set((draft) => {
        if (!draft.homebase.tabOrdering.local.includes(tabName)) {
          draft.homebase.tabOrdering.local.push(tabName);
        }
      }, "addExistingTabToOrder");
      return get().homebase.commitTabOrderingToDatabase();
    }

    const req: UnsignedManageHomebaseTabsRequest = {
      publicKey,
      type: "create",
      tabName,
    };
    const signedReq = await signSignable(
      req,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );
    const initialConfig = {
      ...cloneDeep(INITIAL_HOMEBASE_CONFIG),
      theme: {
        ...cloneDeep(INITIAL_HOMEBASE_CONFIG.theme),
        id: `Homebase-${tabName}-Theme`,
        name: `Homebase-${tabName}-Theme`,
      },
    };
    const file = await get().account.createEncryptedSignedFile(
      stringify(initialConfig),
      "json",
      { useRootKey: true },
    );
    try {
      const { data } = await axiosBackend.post<ManageHomebaseTabsResponse>(
        "/api/space/homebase/tabs",
        { request: signedReq, file },
      );
      if (data.result === "success") {
        // console.log('Successfully created tab:', {
        //   tabName,
        //   fidgetCount: Object.keys(initialConfig.fidgetInstanceDatums || {}).length
        // });
        
        set((draft) => {
          // Add the new tab to the tabs object
          draft.homebase.tabs[tabName] = {
            config: cloneDeep(initialConfig),
            remoteConfig: cloneDeep(initialConfig),
          };

          // Add the new tab to the local tab order
          if (!draft.homebase.tabOrdering.local.includes(tabName)) {
            draft.homebase.tabOrdering.local.push(tabName);
          }
        }, "createHomebaseTab");

        // Commit the new tab order to the database
        return get().homebase.commitTabOrderingToDatabase();
      }
    } catch (e) {
      console.error('Failed to create tab:', e);
    }
  },
  async deleteTab(tabName) {
    // console.log('Deleting tab:', { tabName });
    const publicKey = get().account.currentSpaceIdentityPublicKey;
    if (!publicKey) return;
    const req: UnsignedManageHomebaseTabsRequest = {
      publicKey,
      type: "delete",
      tabName,
    };
    const signedReq = await signSignable(
      req,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );
    try {
      const { data } = await axiosBackend.post<ManageHomebaseTabsResponse>(
        "/api/space/homebase/tabs",
        { request: signedReq },
      );
      if (data.result === "success") {
        // console.log('Successfully deleted tab:', { tabName });
        // Update both the tabs and ordering atomically
        set((draft) => {
          // Remove from tabs object
          delete draft.homebase.tabs[tabName];
          
          // Remove from tab ordering and ensure it's a new array
          draft.homebase.tabOrdering.local = [...draft.homebase.tabOrdering.local]
            .filter(name => name !== tabName);
        }, "deleteHomebaseTab");

        // Commit the updated tab order to the database
        await get().homebase.commitTabOrderingToDatabase();
      }
    } catch (e) {
      console.error('Failed to delete tab:', e);
      throw e; // Propagate error to handler
    }
  },
  async renameTab(tabName, newName) {
    const publicKey = get().account.currentSpaceIdentityPublicKey;
    if (!publicKey) return;

    const sanitizedNewName = newName.trim();
    if (!sanitizedNewName || sanitizedNewName === tabName) {
      return;
    }

    // Validate tab name using shared utility
    const validationError = validateTabName(sanitizedNewName);
    if (validationError) {
      const error = new Error(validationError);
      (error as any).status = 400;
      throw error;
    }

    // Check for duplicates - should not happen since UI ensures uniqueness
    // but log a warning just in case
    const existingTabs = get().homebase.tabOrdering.local;
    if (isDuplicateTabName(sanitizedNewName, existingTabs, tabName)) {
      console.warn(`Tab name "${sanitizedNewName}" already exists - UI should have ensured uniqueness`);
      return; // Exit gracefully instead of throwing
    }

    const previousOrderLocal = cloneDeep(existingTabs);
    const previousOrderRemote = cloneDeep(get().homebase.tabOrdering.remote);
    
    // If tab doesn't exist in memory yet, create an empty entry for it
    // This can happen if the tab exists in ordering but hasn't been loaded yet
    if (!get().homebase.tabs[tabName]) {
      console.warn(`Tab "${tabName}" not loaded yet, creating empty entry for rename`);
      set((draft) => {
        if (!draft.homebase.tabs[tabName]) {
          draft.homebase.tabs[tabName] = {};
        }
      }, "ensureTabExists");
    }
    
    const previousTabState = cloneDeep(get().homebase.tabs[tabName]);

    const updatedOrder = previousOrderLocal.map((name) =>
      name === tabName ? sanitizedNewName : name,
    );

    // Use shared optimistic update pattern
    return withOptimisticUpdate({
      updateFn: () => {
        set((draft) => {
          const tabEntry = draft.homebase.tabs[tabName];
          if (!tabEntry) {
            return;
          }

          draft.homebase.tabs[sanitizedNewName] = tabEntry;
          delete draft.homebase.tabs[tabName];
          draft.homebase.tabOrdering.local = updatedOrder;

          if (draft.currentSpace.currentTabName === tabName) {
            draft.currentSpace.currentTabName = sanitizedNewName;
          }
        }, "renameHomebaseTabOptimistic");
      },
      commitFn: async () => {
        const req: UnsignedManageHomebaseTabsRequest = {
          publicKey,
          type: "rename",
          tabName,
          newName: sanitizedNewName,
        };
        const signedReq = await signSignable(
          req,
          get().account.getCurrentIdentity()!.rootKeys.privateKey,
        );

        const { data } = await axiosBackend.post<ManageHomebaseTabsResponse>(
          "/api/space/homebase/tabs",
          { request: signedReq },
        );
        
        if (data.result !== "success") {
          throw new Error("Failed to rename tab");
        }

        // Update remoteConfig to reflect the new name after successful rename
        set((draft) => {
          const tabEntry = draft.homebase.tabs[sanitizedNewName];
          if (tabEntry && tabEntry.config) {
            // Update the remoteConfig to point to the new name
            tabEntry.remoteConfig = cloneDeep(tabEntry.config);
          }
        }, "updateRemoteConfigAfterRename");

        // Update remote ordering to match the new local ordering
        set((draft) => {
          draft.homebase.tabOrdering.remote = cloneDeep(updatedOrder);
        }, "updateRemoteOrderingAfterRename");

        // Persist the updated ordering to the backend
        await get().homebase.commitTabOrderingToDatabase();
      },
      rollbackFn: () => {
        set((draft) => {
          if (draft.homebase.tabs[sanitizedNewName]) {
            draft.homebase.tabs[tabName] = draft.homebase.tabs[sanitizedNewName];
            delete draft.homebase.tabs[sanitizedNewName];
          } else {
            draft.homebase.tabs[tabName] = cloneDeep(previousTabState);
          }
          draft.homebase.tabOrdering.local = previousOrderLocal;
          draft.homebase.tabOrdering.remote = previousOrderRemote;

          if (draft.currentSpace.currentTabName === sanitizedNewName) {
            draft.currentSpace.currentTabName = tabName;
          }
        }, "renameHomebaseTabRollback");
      },
      errorConfig: {
        title: "Error Renaming Tab",
        message: "We couldn't rename this tab. Your original tab name has been restored.",
      },
    });
  },
  async loadHomebaseTab(tabName) {
    // console.log('Loading homebase tab:', { tabName });
    if (!has(get().homebase.tabs, tabName)) return;

    const supabase = createClient();
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("private")
      .getPublicUrl(
        `${homebaseTabsPath(get().account.currentSpaceIdentityPublicKey!, tabName)}`,
      );
    try {
      const { data } = await axios.get<Blob>(publicUrl, {
        responseType: "blob",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const fileData = JSON.parse(await data.text()) as SignedFile;
      const remoteConfig = JSON.parse(
        await get().account.decryptEncryptedSignedFile(fileData),
      ) as SpaceConfig;
      
      // console.log('Loaded homebase tab config:', {
      //   tabName,
      //   timestamp: remoteConfig.timestamp,
      //   fidgetCount: Object.keys(remoteConfig.fidgetInstanceDatums || {}).length
      // });
      
      // Only overwrite local config if remote is newer (same pattern as loadHomebase)
      const existingTab = get().homebase.tabs[tabName];
      
      // If we have a local config with a newer timestamp, keep it
      // If remote config has no timestamp, preserve local changes
      if (existingTab?.config?.timestamp && 
          (!remoteConfig.timestamp || moment(existingTab.config.timestamp).isAfter(moment(remoteConfig.timestamp)))) {
        // console.log('Local config is newer, keeping it:', {
        //   tabName,
        //   localTimestamp: existingTab.config.timestamp,
        //   remoteTimestamp: remoteConfig.timestamp
        // });
        // Still update remoteConfig to track what's in the database
        set((draft) => {
          draft.homebase.tabs[tabName].remoteConfig = cloneDeep(remoteConfig);
        }, `loadHomebaseTab:${tabName}-remote-only`);
        return existingTab.config;
      }
      
      // Remote is newer or local doesn't exist, load the remote configuration
      // console.log('Remote config is newer or local empty, updating:', {
      //   tabName,
      //   remoteTimestamp: remoteConfig.timestamp
      // });
      set((draft) => {
        draft.homebase.tabs[tabName].config = cloneDeep(remoteConfig);
        draft.homebase.tabs[tabName].remoteConfig = cloneDeep(remoteConfig);
      }, `loadHomebaseTab:${tabName}-found`);
      return remoteConfig;
    } catch (e) {
      // console.log('Failed to load tab config, checking for local config:', { tabName });
      const existingTab = get().homebase.tabs[tabName];
      
      // If we have a local config, preserve it instead of falling back to default
      if (existingTab?.config) {
        // console.log('Preserving existing local config:', { tabName });
        return existingTab.config;
      }
      
      // Only fall back to default if no local config exists
      // console.log('No local config found, using default:', { tabName });
      set((draft) => {
        draft.homebase.tabs[tabName].config = cloneDeep(
          INITIAL_HOMEBASE_CONFIG,
        );
        draft.homebase.tabs[tabName].remoteConfig = cloneDeep(
          INITIAL_HOMEBASE_CONFIG,
        );
      }, "loadHomebase-default");
      return cloneDeep(INITIAL_HOMEBASE_CONFIG);
    }
  },
  commitHomebaseTabToDatabase: debounce(async (tabname) => {
    // console.log('Committing tab to database:', { tabname });
    const tab = get().homebase.tabs[tabname];
    if (tab && tab.config) {
      const localCopy = cloneDeep(tab.config);
      
      // console.log('Tab config to commit:', {
      //   tabname,
      //   timestamp: localCopy.timestamp,
      //   fidgetCount: Object.keys(localCopy.fidgetInstanceDatums || {}).length
      // });
      
      const file = await get().account.createEncryptedSignedFile(
        stringify(localCopy),
        "json",
        { useRootKey: true, fileName: tabname },
      );
      try {
        await axiosBackend.post(`/api/space/homebase/tabs/${tabname}`, file);
        set((draft) => {
          draft.homebase.tabs[tabname].remoteConfig = localCopy;
        }, "commitHomebaseToDatabase");
      } catch (e) {
        console.error('Failed to commit tab:', e);
        throw e;
      }
    }
  }, 1000),
  async saveHomebaseTabConfig(tabName, config) {
    const localCopy = cloneDeep(
      get().homebase.tabs[tabName].config,
    ) as SpaceConfig;
    mergeWith(localCopy, config, (objValue, srcValue) => {
      if (isArray(srcValue)) return srcValue;
      if (typeof srcValue === 'object' && srcValue !== null) {
        // For objects, return the source value to replace the target completely
        return srcValue;
      }
    });
    // Update timestamp to mark this as a local change
    localCopy.timestamp = moment().toISOString();
    set(
      (draft) => {
        draft.homebase.tabs[tabName].config = localCopy;
      },
      `saveHomebaseTab:${tabName}`,
      false,
    );
  },
  async resetHomebaseTabConfig(tabName) {
    // console.log('Resetting tab config:', { tabName });
    const currentTabInfo = get().homebase.tabs[tabName];
    if (currentTabInfo) {
      set((draft) => {
        draft.homebase.tabs[tabName].config = cloneDeep(
          currentTabInfo.remoteConfig,
        );
      }, `resetHomebaseTab${tabName}`);
    }
  },
  clearHomebaseTabs() {
    // console.log('Clearing all homebase tabs');
    set((draft) => {
      draft.homebase.tabs = {};
    }, "clearHomebaseTabs");
  },
});