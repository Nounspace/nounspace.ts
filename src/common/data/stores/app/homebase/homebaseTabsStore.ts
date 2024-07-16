import {
  SpaceConfig,
  SpaceConfigSaveDetails,
} from "@/common/components/templates/Space";
import { StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import { cloneDeep, debounce, forEach, has, isArray, mergeWith } from "lodash";
import stringify from "fast-json-stable-stringify";
import axiosBackend from "@/common/data/api/backend";
import {
  ManageHomebaseTabsResponse,
  UnsignedManageHomebaseTabsRequest,
} from "@/pages/api/space/homebase/tabs";
import { createClient } from "@/common/data/database/supabase/clients/component";
import { homebasePath } from "@/constants/supabase";
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
}

interface HomeBaseTabStoreActions {
  loadTabNames: () => Promise<string[]>;
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
};

export const createHomeBaseTabStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): HomeBaseTabStore => ({
  ...homeBaseStoreDefaults,
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
        set((draft) => {
          // Reset all tabs, this removes all ones that no longer exist
          draft.homebase.tabs = {};
          forEach(data.value || [], (tabName) => {
            // Set the tabs that we have and add the missing ones
            draft.homebase.tabs[tabName] = currentTabs[tabName] || {};
          });
        }, "loadTabNames");
        return data.value || [];
      }
    } catch (e) {
      console.debug("failed to load tab names", e);
      return [];
    }
  },
  async createTab(tabName) {
    const publicKey = get().account.currentSpaceIdentityPublicKey;
    if (!publicKey) return;
    const req: UnsignedManageHomebaseTabsRequest = {
      publicKey,
      type: "create",
      tabName,
    };
    const sigendReq = await signSignable(
      req,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );
    try {
      const { data } = await axiosBackend.post<ManageHomebaseTabsResponse>(
        "/api/space/homebase/tabs",
        sigendReq,
      );
      if (data.result === "success") {
        set((draft) => {
          draft.homebase.tabs[tabName] = {
            config: cloneDeep(INITIAL_HOMEBASE_CONFIG),
            remoteConfig: cloneDeep(INITIAL_HOMEBASE_CONFIG),
          };
        }, "createHomebaseTab");
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
    const sigendReq = await signSignable(
      req,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );
    try {
      const { data } = await axiosBackend.post<ManageHomebaseTabsResponse>(
        "/api/space/homebase/tabs",
        sigendReq,
      );
      if (data.result === "success") {
        set((draft) => {
          delete draft.homebase.tabs[tabName];
        }, "deleteHomebaseTab");
      }
    } catch (e) {
      console.debug("failed to delete homebase tab", e);
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
    const sigendReq = await signSignable(
      req,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );
    try {
      const { data } = await axiosBackend.post<ManageHomebaseTabsResponse>(
        "/api/space/homebase/tabs",
        sigendReq,
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
        `${homebasePath(get().account.currentSpaceIdentityPublicKey!)}/tabs/${tabName}`,
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
      set((draft) => {
        draft.homebase.tabs[tabName].config = cloneDeep(spaceConfig);
        draft.homebase.tabs[tabName].remoteConfig = cloneDeep(spaceConfig);
      }, `loadHomebase${tabName}-found`);
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
    const localCopy = cloneDeep(get().homebase.tabs[tabname].config);
    if (localCopy) {
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
    const localCopy = cloneDeep(get().homebase.tabs[tabName]) as SpaceConfig;
    mergeWith(localCopy, config, (_, newItem) => {
      if (isArray(newItem)) return newItem;
    });
    set(
      (draft) => {
        draft.homebase.tabs[tabName].config = localCopy;
      },
      `saveHomebaseTab${tabName}`,
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
