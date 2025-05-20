import {
  SpaceConfig,
  SpaceConfigSaveDetails,
} from "@/app/(spaces)/Space";
import axiosBackend from "@/common/data/api/backend";
import { createClient } from "@/common/data/database/supabase/clients/component";
import { SignedFile, signSignable } from "@/common/lib/signedFiles";
import INITIAL_HOMEBASE_CONFIG from "@/constants/intialHomebase";
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
import { AppStore } from "..";
import { StoreGet, StoreSet } from "../../createStore";

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

// Function to show tooltip using DOM elements
const showTooltipError = (title: string, description: string) => {
  // Only run in browser environment
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  // Create a simple error message element
  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '20px';
  errorContainer.style.right = '20px';
  errorContainer.style.zIndex = '9999999999999999';
  errorContainer.style.backgroundColor = '#ef4444';
  errorContainer.style.color = 'white';
  errorContainer.style.padding = '16px';
  errorContainer.style.borderRadius = '6px';
  errorContainer.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
  errorContainer.style.maxWidth = '400px';
  
  const titleElement = document.createElement('h3');
  titleElement.style.fontWeight = 'bold';
  titleElement.style.marginBottom = '4px';
  titleElement.textContent = title;
  
  const descriptionElement = document.createElement('p');
  descriptionElement.textContent = description;
  
  errorContainer.appendChild(titleElement);
  errorContainer.appendChild(descriptionElement);
  document.body.appendChild(errorContainer);
  
  // Remove after timeout
  setTimeout(() => {
    document.body.removeChild(errorContainer);
  }, 4000);
};

// Add validation function
const validateTabName = (tabName: string): string | null => {
  if (/[^a-zA-Z0-9-_ ]/.test(tabName)) {
    return "The tab name contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed.";
  }
  return null;
};

export const createHomeBaseTabStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): HomeBaseTabStore => ({
  ...homeBaseStoreDefaults,
  updateTabOrdering(newOrdering, commit = false) {
    const filtered = newOrdering.filter((name, index) => {
      return name !== "Feed" && newOrdering.indexOf(name) === index;
    });
    set((draft) => {
      draft.homebase.tabOrdering.local = filtered;
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
        draft.homebase.tabOrdering = {
          local: clone(tabOrder),
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
        name !== "Feed" && arr.indexOf(name) === i,
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
        await axiosBackend.post(`/api/space/homebase/tabOrder/`, file);
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
        const currentTabs = get().homebase.tabs;
        const validTabNames = data.value || [];
        
        // console.log('Loaded tab names:', {
        //   tabCount: validTabNames.length,
        //   tabs: validTabNames
        // });
        
        set((draft) => {
          // Reset all tabs, this removes all ones that no longer exist
          draft.homebase.tabs = {};
          forEach(validTabNames, (tabName) => {
            // Set the tabs that we have and add the missing ones
            draft.homebase.tabs[tabName] = currentTabs[tabName] || {};
          });

          // Clean up tab order by removing tabs that no longer exist
          draft.homebase.tabOrdering.local = draft.homebase.tabOrdering.local.filter(
            tabName => validTabNames.includes(tabName)
          );

          // Add back any valid tabs that aren't in the tab order
          validTabNames.forEach(tabName => {
            if (!draft.homebase.tabOrdering.local.includes(tabName)) {
              draft.homebase.tabOrdering.local.push(tabName);
            }
          });
        }, "loadTabNames");

        // Load remote state for any tabs that don't have it
        for (const tabName of validTabNames) {
          if (!get().homebase.tabs[tabName]?.remoteConfig) {
            await get().homebase.loadHomebaseTab(tabName);
          }
        }

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
    // console.log('Renaming tab:', { from: tabName, to: newName });
    const publicKey = get().account.currentSpaceIdentityPublicKey;
    if (!publicKey) return;

    if (/[^a-zA-Z0-9-_ ]/.test(newName)) {
      showTooltipError(
        "Invalid Tab Name", 
        "The tab name contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed."
      );
      
      const error = new Error(
        "The tab name contains invalid characters. Only letters, numbers, hyphens, underscores, and spaces are allowed."
      );
      (error as any).status = 400;
      throw error;
    }

    const req: UnsignedManageHomebaseTabsRequest = {
      publicKey,
      type: "rename",
      tabName,
      newName,
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
        // console.log('Successfully renamed tab:', { from: tabName, to: newName });
        const currentTabData = get().homebase.tabs[tabName];
        set((draft) => {
          delete draft.homebase.tabs[tabName];
          draft.homebase.tabs[newName] = currentTabData;
        }, "renameHomebaseTab");
      }
    } catch (e) {
      console.error('Failed to rename tab:', e);
    }
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
      const spaceConfig = JSON.parse(
        await get().account.decryptEncryptedSignedFile(fileData),
      ) as SpaceConfig;
      
      // console.log('Loaded homebase tab config:', {
      //   tabName,
      //   timestamp: spaceConfig.timestamp,
      //   fidgetCount: Object.keys(spaceConfig.fidgetInstanceDatums || {}).length
      // });
      
      set((draft) => {
        draft.homebase.tabs[tabName].config = cloneDeep(spaceConfig);
        draft.homebase.tabs[tabName].remoteConfig = cloneDeep(spaceConfig);
      }, `loadHomebaseTab:${tabName}-found`);
      return spaceConfig;
    } catch (e) {
      // console.log('Failed to load tab config, using default:', { tabName });
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