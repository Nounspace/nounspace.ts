import {
  SpaceConfig,
  SpaceConfigSaveDetails,
} from "@/app/(spaces)/Space";
import { StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import {
  clone,
  cloneDeep,
  debounce,
  forEach,
  has,
  isArray,
  mergeWith,
} from "lodash";
import stringify from "fast-json-stable-stringify";
import axiosBackend from "@/common/data/api/backend";
import {
  ManageHomebaseTabsResponse,
  UnsignedManageHomebaseTabsRequest,
} from "@/pages/api/space/homebase/tabs";
import { createClient } from "@/common/data/database/supabase/clients/component";
import { homebaseTabOrderPath, homebaseTabsPath } from "@/constants/supabase";
import axios from "axios";
import { SignedFile, signSignable } from "@/common/lib/signedFiles";
import INITIAL_HOMEBASE_CONFIG from "@/constants/intialHomebase";

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
    const supabase = createClient();
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("private")
      .getPublicUrl(
        `${homebaseTabOrderPath(get().account.currentSpaceIdentityPublicKey!)}`,
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
      const tabOrder = JSON.parse(
        await get().account.decryptEncryptedSignedFile(fileData),
      ) as string[];
      set((draft) => {
        draft.homebase.tabOrdering = {
          local: clone(tabOrder),
          remote: clone(tabOrder),
        };
      }, `loadHomebaseTabOrdering`);
      return tabOrder;
    } catch (e) {
      return [];
    }
  },
  commitTabOrderingToDatabase: debounce(async () => {
    const localCopy = cloneDeep(get().homebase.tabOrdering.local);
    if (localCopy) {
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
        console.error(e);
        throw e;
      }
    }
  }, 1000),
  async loadTabNames() {
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
        return [];
      } else {
        const currentTabs = get().homebase.tabs;
        const validTabNames = data.value || [];
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
      console.debug("failed to load tab names", e);
      return [];
    }
  },
  async createTab(tabName) {
    const publicKey = get().account.currentSpaceIdentityPublicKey;
    if (!publicKey) return;

    // Check if tab already exists
    if (get().homebase.tabs[tabName]) {
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
      console.debug("failed to create homebase tab", e);
    }
  },
  async deleteTab(tabName) {
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
      console.debug("failed to delete homebase tab", e);
      throw e; // Propagate error to handler
    }
  },
  async renameTab(tabName, newName) {
    const publicKey = get().account.currentSpaceIdentityPublicKey;
    if (!publicKey) return;
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
        const currentTabData = get().homebase.tabs[tabName];
        set((draft) => {
          delete draft.homebase.tabs[tabName];
          draft.homebase.tabs[newName] = currentTabData;
        }, "renameHomebaseTab");
      }
    } catch (e) {
      console.debug("failed to rename homebase tab", e);
    }
  },
  async loadHomebaseTab(tabName) {
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
      // console.log("spaceConfig", spaceConfig);
      set((draft) => {
        draft.homebase.tabs[tabName].config = cloneDeep(spaceConfig);
        draft.homebase.tabs[tabName].remoteConfig = cloneDeep(spaceConfig);
      }, `loadHomebaseTab:${tabName}-found`);
      return spaceConfig;
    } catch (e) {
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
    const tab = get().homebase.tabs[tabname];
    if (tab && tab.config) {
      const localCopy = cloneDeep(tab.config);
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
        console.error(e);
        throw e;
      }
    }
  }, 1000),
  async saveHomebaseTabConfig(tabName, config) {
    const localCopy = cloneDeep(
      get().homebase.tabs[tabName].config,
    ) as SpaceConfig;
    mergeWith(localCopy, config, (_, newItem) => {
      if (isArray(newItem)) return newItem;
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
    set((draft) => {
      draft.homebase.tabs = {};
    }, "clearHomebaseTabs");
  },
});