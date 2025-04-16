import { StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import axios from "axios";
import { createClient } from "@/common/data/database/supabase/clients/component";
import { homebasePath } from "@/constants/supabase";
import { SignedFile } from "@/common/lib/signedFiles";
import { cloneDeep, debounce, isArray, isUndefined, mergeWith } from "lodash";
import stringify from "fast-json-stable-stringify";
import axiosBackend from "@/common/data/api/backend";
import {
  SpaceConfig,
  SpaceConfigSaveDetails,
} from "@/app/(spaces)/Space";
import INITIAL_HOMEBASE_CONFIG from "@/constants/intialHomebase";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";
import {
  HomeBaseTabStore,
  createHomeBaseTabStoreFunc,
} from "./homebaseTabsStore";
import moment from "moment";

interface HomeBaseStoreState {
  homebaseConfig?: SpaceConfig;
  remoteHomebaseConfig?: SpaceConfig;
}

interface HomeBaseStoreActions {
  loadHomebase: () => Promise<SpaceConfig>;
  commitHomebaseToDatabase: () => Promise<void> | undefined;
  saveHomebaseConfig: (config: SpaceConfigSaveDetails) => Promise<void>;
  resetHomebaseConfig: () => Promise<void>;
  clearHomebase: () => void;
  clearHomebaseTabOrder: () => void;
}

export type HomeBaseStore = HomeBaseStoreState &
  HomeBaseStoreActions &
  HomeBaseTabStore;

export const homeBaseStoreDefaults: HomeBaseStoreState = {};

export const createHomeBaseStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): HomeBaseStore => ({
  ...homeBaseStoreDefaults,
  ...createHomeBaseTabStoreFunc(set, get),
  loadHomebase: async () => {
    console.log('Loading homebase...');
    const supabase = createClient();
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("private")
      .getPublicUrl(homebasePath(get().account.currentSpaceIdentityPublicKey!));
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
      
      console.log('Loaded homebase config:', {
        timestamp: spaceConfig.timestamp,
        tabCount: Object.keys(spaceConfig.tabs || {}).length,
        fidgetCount: Object.keys(spaceConfig.fidgetInstanceDatums || {}).length
      });

      const currentHomebase = get().homebase.homebaseConfig;
      if (
        (spaceConfig &&
          spaceConfig.timestamp &&
          currentHomebase &&
          currentHomebase.timestamp &&
          moment(spaceConfig.timestamp).isAfter(
            moment(currentHomebase.timestamp),
          )) ||
        (spaceConfig &&
          isUndefined(spaceConfig.timestamp) &&
          currentHomebase &&
          currentHomebase.timestamp)
      ) {
        console.log('Using local homebase config as it is more recent');
        return cloneDeep(currentHomebase);
      }
      set((draft) => {
        draft.homebase.homebaseConfig = cloneDeep(spaceConfig);
        draft.homebase.remoteHomebaseConfig = cloneDeep(spaceConfig);
      }, "loadHomebase-found");
      return spaceConfig;
    } catch (e) {
      console.log('Failed to load homebase, using default config');
      set((draft) => {
        draft.homebase.homebaseConfig = {
          ...cloneDeep(INITIAL_HOMEBASE_CONFIG),
          theme: {
            ...cloneDeep(INITIAL_HOMEBASE_CONFIG.theme),
            id: `Homebase-Feed-Theme`,
            name: `Homebase-Feed-Theme`,
          },
        };
        draft.homebase.remoteHomebaseConfig = {
          ...cloneDeep(INITIAL_HOMEBASE_CONFIG),
          theme: {
            ...cloneDeep(INITIAL_HOMEBASE_CONFIG.theme),
            id: `Homebase-Feed-Theme`,
            name: `Homebase-Feed-Theme`,
          },
        };
      }, "loadHomebase-default");
      return cloneDeep(INITIAL_HOMEBASE_CONFIG);
    }
  },
  commitHomebaseToDatabase: debounce(async () => {
    const localCopy = cloneDeep(get().homebase.homebaseConfig);
    if (localCopy) {
      console.log('Committing homebase to database:', {
        timestamp: localCopy.timestamp,
        tabCount: Object.keys(localCopy.tabs || {}).length,
        fidgetCount: Object.keys(localCopy.fidgetInstanceDatums || {}).length
      });
      
      const file = await get().account.createEncryptedSignedFile(
        stringify(localCopy),
        "json",
        { useRootKey: true },
      );
      try {
        await axiosBackend.post(`/api/space/homebase`, file);
        set((draft) => {
          draft.homebase.remoteHomebaseConfig = localCopy;
        }, "commitHomebaseToDatabase");
        analytics.track(AnalyticsEvent.SAVE_HOMEBASE_THEME);
      } catch (e) {
        console.error('Failed to commit homebase:', e);
        throw e;
      }
    }
  }, 1000),
  saveHomebaseConfig: async (config) => {
    console.log('Saving homebase config:', {
      timestamp: config.timestamp,
      tabCount: Object.keys(config.tabs || {}).length,
      fidgetCount: Object.keys(config.fidgetInstanceDatums || {}).length
    });

    const localCopy = cloneDeep(get().homebase.homebaseConfig) as SpaceConfig;
    mergeWith(localCopy, config, (_, newItem) => {
      if (isArray(newItem)) return newItem;
    });
    localCopy.timestamp = moment().toISOString();
    set(
      (draft) => {
        draft.homebase.homebaseConfig = localCopy;
      },
      "saveHomebaseConfig",
      false,
    );
  },
  resetHomebaseConfig: async () => {
    const remote = cloneDeep(get().homebase.remoteHomebaseConfig);
    console.log('Resetting homebase config to remote state:', {
      timestamp: remote.timestamp,
      tabCount: Object.keys(remote.tabs || {}).length,
      fidgetCount: Object.keys(remote.fidgetInstanceDatums || {}).length
    });
    
    set((draft) => {
      draft.homebase.homebaseConfig = remote;
    }, "resetHomebaseConfig");
  },
  clearHomebase: () => {
    console.log('Clearing homebase config');
    set(
      (draft) => {
        draft.homebase.homebaseConfig = undefined;
        draft.homebase.remoteHomebaseConfig = undefined;
      },
      "clearHomebase",
      true,
    );
  },
  clearHomebaseTabOrder: () => {
    console.log('Clearing homebase tab order');
    set(
      (draft) => {
        draft.homebase.tabOrdering.local = [];
      },
      "clearHomebaseTabOrder",
      true,
    );
  },
});

export function partializedHomebaseStore(state: AppStore) {
  return {
    homebaseConfig: state.homebase.homebaseConfig,
    remoteHomebaseConfig: state.homebase.remoteHomebaseConfig,
  };
}
