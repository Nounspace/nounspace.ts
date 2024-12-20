import {
  SpaceConfig,
  SpaceConfigSaveDetails,
} from "@/common/components/templates/Space";
import { AppStore } from "..";
import { FidgetConfig, FidgetInstanceData } from "@/common/fidgets";
import { StoreGet, StoreSet } from "../../createStore";
import axiosBackend from "../../../api/backend";
import {
  ModifiableSpacesResponse,
  RegisterNewSpaceResponse,
  SpaceRegistration,
} from "@/pages/api/space/registry";
import {
  cloneDeep,
  debounce,
  filter,
  fromPairs,
  isArray,
  isNil,
  isUndefined,
  map,
  mergeWith,
} from "lodash";
import moment from "moment";
import { SignedFile, signSignable } from "@/common/lib/signedFiles";
import stringify from "fast-json-stable-stringify";
import { createClient } from "../../../database/supabase/clients/component";
import axios from "axios";
import createIntialPersonSpaceConfigForFid, {
  INITIAL_SPACE_CONFIG_EMPTY,
} from "@/constants/initialPersonSpace";
import { UnsignedDeleteSpaceTabRequest } from "@/pages/api/space/registry/[spaceId]/tabs/[tabId]";
import {
  RegisterNewSpaceTabResponse,
  UnsignedSpaceTabRegistration,
} from "@/pages/api/space/registry/[spaceId]/tabs";
import {
  UnsignedUpdateTabOrderRequest,
  UpdateTabOrderRequest,
} from "@/pages/api/space/registry/[spaceId]";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";
type SpaceId = string;

// SpaceConfig includes all of the Fidget Config
// But a space that is saved in the DB doesn't store
// Fidget data or editability
// So we rebuild the details, but without those fields
export type DatabaseWritableSpaceConfig = Omit<
  SpaceConfig,
  "fidgetInstanceDatums" | "isEditable"
> & {
  fidgetInstanceDatums: {
    [key: string]: Omit<FidgetInstanceData, "config"> & {
      config: Omit<FidgetConfig, "data">;
    };
  };
};

export type DatabaseWritableSpaceSaveConfig = Partial<
  Omit<SpaceConfigSaveDetails, "fidgetInstanceDatums" | "isEditable">
> & {
  fidgetInstanceDatums: {
    [key: string]: Omit<FidgetInstanceData, "config"> & {
      config: Omit<FidgetConfig, "data">;
    };
  };
};

export type UpdatableDatabaseWritableSpaceSaveConfig =
  DatabaseWritableSpaceSaveConfig & {
    isPrivate?: boolean;
  };

export type UpdatableSpaceConfig = DatabaseWritableSpaceConfig & {
  isPrivate: boolean;
};

interface CachedSpace {
  // Machine generated ID, immutable
  id: SpaceId;
  updatedAt: string;
  tabs: {
    [tabName: string]: UpdatableSpaceConfig;
  };
  order: string[];
}

interface LocalSpace extends CachedSpace {
  changedNames: {
    [newName: string]: string;
  };
}

interface SpaceState {
  remoteSpaces: Record<string, CachedSpace>;
  editableSpaces: Record<SpaceId, string>;
  localSpaces: Record<string, LocalSpace>;
}

export interface SpaceLookupInfo {
  spaceId: string;
  name: string;
}

interface SpaceActions {
  commitSpaceTabToDatabase: (
    spaceId: string,
    tabName: string,
  ) => Promise<void> | undefined;
  saveLocalSpaceTab: (
    spaceId: string,
    tabName: string,
    config: UpdatableDatabaseWritableSpaceSaveConfig,
    newName?: string,
  ) => Promise<void>;
  loadEditableSpaces: () => Promise<Record<SpaceId, string>>;
  loadSpaceTabOrder: (spaceId: string) => Promise<void>;
  loadSpaceTab: (
    spaceId: string,
    tabName: string,
    fid?: number,
  ) => Promise<void>;
  deleteSpaceTab: (
    spaceId: string,
    tabName: string,
  ) => Promise<void> | undefined;
  createSpaceTab: (
    spaceId: string,
    tabName: string,
    initialConfig?: Omit<SpaceConfig, "isEditable">,
  ) => Promise<void> | undefined;
  updateLocalSpaceOrder: (spaceId: string, newOrder: string[]) => Promise<void>;
  commitSpaceOrderToDatabase: (spaceId: string) => Promise<void> | undefined;
  registerSpace: (fid: number, name: string) => Promise<string | undefined>;
  clear: () => void;
}

export type SpaceStore = SpaceState & SpaceActions;

export const spaceStoreprofiles: SpaceState = {
  remoteSpaces: {},
  editableSpaces: {},
  localSpaces: {},
};

export const createSpaceStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): SpaceStore => ({
  ...spaceStoreprofiles,
  commitSpaceTabToDatabase: debounce(
    async (spaceId: string, tabName: string) => {
      const localCopy = cloneDeep(
        get().space.localSpaces[spaceId].tabs[tabName],
      );
      const oldTabName =
        get().space.localSpaces[spaceId].changedNames[tabName] || tabName;
      if (localCopy) {
        const file = await get().account.createSignedFile(
          stringify(localCopy),
          "json",
          { fileName: tabName },
        );
        try {
          await axiosBackend.post(
            `/api/space/registry/${spaceId}/tabs/${oldTabName}`,
            file,
          );
          set((draft) => {
            draft.space.remoteSpaces[spaceId].tabs[tabName] = localCopy;
            delete draft.space.remoteSpaces[spaceId].tabs[oldTabName];
            delete draft.space.localSpaces[spaceId].changedNames[tabName];
          }, "commitSpaceTabToDatabase");
        } catch (e) {
          console.error(e);
          throw e;
        }
      }
    },
    1000,
  ),
  saveLocalSpaceTab: async (spaceId, tabName, config, newName) => {
    const localCopy = cloneDeep(get().space.localSpaces[spaceId].tabs[tabName]);
    mergeWith(localCopy, config, (_, newItem) => {
      if (isArray(newItem)) return newItem;
    });
    set((draft) => {
      if (!isNil(newName) && newName.length > 0 && newName !== tabName) {
        draft.space.localSpaces[spaceId].changedNames[newName] = tabName;
        draft.space.localSpaces[spaceId].tabs[newName] = localCopy;
        delete draft.space.localSpaces[spaceId].tabs[tabName];
      } else {
        draft.space.localSpaces[spaceId].tabs[tabName] = localCopy;
      }
      const newTimestamp = moment().toISOString();
      draft.space.localSpaces[spaceId].updatedAt = newTimestamp;
    }, "saveLocalSpaceTab");
  },
  deleteSpaceTab: debounce(async (spaceId, tabName) => {
    // This deletes locally and remotely at the same time
    // We can separate these out, but I think deleting feels better as a single decisive action
    const unsignedDeleteTabRequest: UnsignedDeleteSpaceTabRequest = {
      publicKey: get().account.currentSpaceIdentityPublicKey!,
      timestamp: moment().toISOString(),
      spaceId,
      tabName,
    };
    const signedRequest = signSignable(
      unsignedDeleteTabRequest,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );
    try {
      await axiosBackend.delete(
        `/api/space/registry/${spaceId}/tabs/${tabName}`,
        { data: signedRequest },
      );
      set((draft) => {
        delete draft.space.localSpaces[spaceId].tabs[tabName];
        delete draft.space.remoteSpaces[spaceId].tabs[tabName];
        draft.space.localSpaces[spaceId].order = filter(
          draft.space.localSpaces[spaceId].order,
          (x) => x !== tabName,
        );
        draft.space.remoteSpaces[spaceId].order = filter(
          draft.space.localSpaces[spaceId].order,
          (x) => x !== tabName,
        );
      }, "deleteSpaceTab");
      return get().space.commitSpaceOrderToDatabase(spaceId);
    } catch (e) {
      console.error(e);
    }
  }, 1000),
  createSpaceTab: debounce(
    async (spaceId, tabName, initialConfig = INITIAL_SPACE_CONFIG_EMPTY) => {
      const unsignedRequest: UnsignedSpaceTabRegistration = {
        identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
        timestamp: moment().toISOString(),
        spaceId,
        tabName,
      };
      const signedRequest = signSignable(
        unsignedRequest,
        get().account.getCurrentIdentity()!.rootKeys.privateKey,
      );
      try {
        await axiosBackend.post<RegisterNewSpaceTabResponse>(
          `/api/space/registry/${spaceId}/tabs`,
          signedRequest,
        );
        set((draft) => {
          if (isUndefined(draft.space.localSpaces[spaceId])) {
            draft.space.localSpaces[spaceId] = {
              tabs: {},
              order: [],
              updatedAt: moment().toISOString(),
              changedNames: {},
              id: spaceId,
            };
          }

          draft.space.localSpaces[spaceId].tabs[tabName] = {
            ...cloneDeep(initialConfig),
            theme: {
              ...cloneDeep(initialConfig.theme),
              id: `${spaceId}-${tabName}-theme`,
              name: `${spaceId}-${tabName}-theme`,
            },
            isPrivate: false,
          };

          draft.space.localSpaces[spaceId].order.push(tabName);
        }, "createSpaceTab");
        analytics.track(AnalyticsEvent.CREATE_NEW_TAB);

        return get().space.commitSpaceOrderToDatabase(spaceId);
      } catch (e) {
        console.error(e);
      }
    },
    1000,
  ),
  updateLocalSpaceOrder: async (spaceId, newOrder) => {
    set((draft) => {
      draft.space.localSpaces[spaceId].order = newOrder;
    });
  },
  commitSpaceOrderToDatabase: debounce(async (spaceId) => {
    const unsignedReq: UnsignedUpdateTabOrderRequest = {
      spaceId,
      tabOrder: get().space.localSpaces[spaceId].order,
      publicKey: get().account.currentSpaceIdentityPublicKey!,
      timestamp: moment().toISOString(),
    };
    const signedRequest = signSignable(
      unsignedReq,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );
    try {
      await axiosBackend.post<RegisterNewSpaceTabResponse>(
        `/api/space/registry/${spaceId}`,
        signedRequest,
      );
      set((draft) => {
        if (isUndefined(draft.space.remoteSpaces[spaceId])) {
          draft.space.remoteSpaces[spaceId] = {
            tabs: {},
            order: [],
            updatedAt: moment(0).toISOString(),
            id: spaceId,
          };
        }

        draft.space.remoteSpaces[spaceId].order = cloneDeep(
          get().space.localSpaces[spaceId].order,
        );
      }, "commitSpaceOrderToDatabase");
      analytics.track(AnalyticsEvent.SAVE_SPACE_THEME);
    } catch (e) {
      console.error(e);
    }
  }, 1000),
  loadSpaceTab: async (spaceId, tabName, fid) => {
    const supabase = createClient();
    try {
      // Fetch the public URL for the space tab file
      const {
        data: { publicUrl },
      } = await supabase.storage
        .from("spaces")
        .getPublicUrl(`${spaceId}/tabs/${tabName}`);

      // Download the file content, ensuring no caching
      const { data } = await axios.get<Blob>(publicUrl, {
        responseType: "blob",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      // Parse the file data and decrypt it
      const fileData = JSON.parse(await data.text()) as SignedFile;
      const remoteSpaceConfig = JSON.parse(
        await get().account.decryptEncryptedSignedFile(fileData),
      ) as DatabaseWritableSpaceConfig;

      // Prepare the remote space config for updating, including privacy status
      const remoteUpdatableSpaceConfig = {
        ...remoteSpaceConfig,
        isPrivate: fileData.isEncrypted,
      };

      set((draft) => {
        // Initialize local and remote spaces if they don't exist
        if (isUndefined(draft.space.localSpaces[spaceId])) {
          draft.space.localSpaces[spaceId] = {
            tabs: {},
            order: [],
            updatedAt: moment().toISOString(),
            changedNames: {},
            id: spaceId,
          };
        }
        if (isUndefined(draft.space.remoteSpaces[spaceId])) {
          draft.space.remoteSpaces[spaceId] = {
            tabs: {},
            order: [],
            updatedAt: moment().toISOString(),
            id: spaceId,
          };
        }

        const localTab = draft.space.localSpaces[spaceId].tabs[tabName];
        // const remoteTab = draft.space.remoteSpaces[spaceId].tabs[tabName];

        // Compare timestamps if local tab exists
        if (localTab) {
          const localTimestamp = moment(localTab.timestamp);
          const remoteTimestamp = moment(remoteUpdatableSpaceConfig.timestamp);

          if (remoteTimestamp.isAfter(localTimestamp)) {
            // Remote is newer, update both local and remote
            draft.space.remoteSpaces[spaceId].tabs[tabName] =
              remoteUpdatableSpaceConfig;
            draft.space.localSpaces[spaceId].tabs[tabName] = cloneDeep(
              remoteUpdatableSpaceConfig,
            );
          } else {
            // Local is newer or same age, keep local data
            draft.space.remoteSpaces[spaceId].tabs[tabName] =
              cloneDeep(localTab);
          }
        } else {
          // No local tab, create it with remote data
          draft.space.remoteSpaces[spaceId].tabs[tabName] =
            remoteUpdatableSpaceConfig;
          draft.space.localSpaces[spaceId].tabs[tabName] = cloneDeep(
            remoteUpdatableSpaceConfig,
          );
        }

        // Update timestamps
        const newTimestamp = moment().toISOString();
        draft.space.remoteSpaces[spaceId].updatedAt = newTimestamp;
        draft.space.localSpaces[spaceId].updatedAt = newTimestamp;
      }, "loadSpaceTab");
    } catch (e) {
      console.error(`Error loading space tab ${spaceId}/${tabName}:`, e);
    }
  },
  loadSpaceTabOrder: async (spaceId: string) => {
    try {
      // Fetch the remote tab order data
      const supabase = createClient();
      const {
        data: { publicUrl },
      } = await supabase.storage
        .from("spaces")
        .getPublicUrl(`${spaceId}/tabOrder`);
      const { data } = await axios.get<Blob>(publicUrl, {
        responseType: "blob",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const tabOrderReq = JSON.parse(
        await data.text(),
      ) as UpdateTabOrderRequest;

      // Compare local and remote timestamps
      const localSpace = get().space.localSpaces[spaceId];
      const remoteTimestamp = moment(tabOrderReq.timestamp);
      const localTimestamp = localSpace
        ? moment(localSpace.updatedAt)
        : moment(0);

      if (remoteTimestamp.isAfter(localTimestamp)) {
        // Remote data is newer, update the store
        set((draft) => {
          // Initialize local space if it doesn't exist
          if (isUndefined(draft.space.localSpaces[spaceId])) {
            draft.space.localSpaces[spaceId] = {
              tabs: {},
              order: [],
              updatedAt: remoteTimestamp.toISOString(),
              changedNames: {},
              id: spaceId,
            };
          }
          // Initialize remote space if it doesn't exist
          if (isUndefined(draft.space.remoteSpaces[spaceId])) {
            draft.space.remoteSpaces[spaceId] = {
              tabs: {},
              order: [],
              updatedAt: remoteTimestamp.toISOString(),
              id: spaceId,
            };
          }

          // Update both local and remote spaces with new tab order
          draft.space.localSpaces[spaceId].order = tabOrderReq.tabOrder;
          draft.space.localSpaces[spaceId].updatedAt =
            remoteTimestamp.toISOString();
          draft.space.remoteSpaces[spaceId].order = tabOrderReq.tabOrder;
          draft.space.remoteSpaces[spaceId].updatedAt =
            remoteTimestamp.toISOString();
        }, "loadSpaceInfo");
      }
    } catch (e) {
      // Error handling: create default local space if needed
      console.debug(e);
      set((draft) => {
        if (isUndefined(draft.space.localSpaces[spaceId])) {
          draft.space.localSpaces[spaceId] = {
            tabs: {},
            order: [],
            updatedAt: moment(0).toISOString(),
            changedNames: {},
            id: spaceId,
          };
        }
        draft.space.localSpaces[spaceId].order = ["Profile"];
        draft.space.localSpaces[spaceId].updatedAt = moment().toISOString();
      }, "loadSpaceInfoProfile");
    }
  },
  registerSpace: async (fid, name) => {
    const unsignedRegistration: Omit<SpaceRegistration, "signature"> = {
      identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
      spaceName: name,
      timestamp: moment().toISOString(),
      fid,
    };
    const registration = signSignable(
      unsignedRegistration,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );
    // TODO: Error handling
    try {
      const { data } = await axiosBackend.post<RegisterNewSpaceResponse>(
        "/api/space/registry",
        registration,
      );
      const newSpaceId = data.value!.spaceId;
      set((draft) => {
        draft.space.editableSpaces[newSpaceId] = name;
      }, "registerSpace");
      await get().space.createSpaceTab(
        newSpaceId,
        "Profile",
        createIntialPersonSpaceConfigForFid(fid),
      );
      // console.log("Created space", newSpaceId);
      return newSpaceId;
    } catch (e) {
      null;
    }
  },
  loadEditableSpaces: async () => {
    try {
      const { data } = await axiosBackend.get<ModifiableSpacesResponse>(
        "/api/space/registry",
        {
          params: {
            identityPublicKey: get().account.currentSpaceIdentityPublicKey,
          },
        },
      );
      if (data.value) {
        const editableSpaces = fromPairs(
          map(data.value.spaces, (si) => [si.spaceId, si.spaceName]),
        );
        set((draft) => {
          draft.space.editableSpaces = editableSpaces;
        }, "loadEditableSpaces");
        return editableSpaces;
      }
      return {};
    } catch (e) {
      console.error(e);
      return {};
    }
  },
  clear: () => {
    set(
      (draft) => {
        draft.space.localSpaces = {};
        draft.space.editableSpaces = {};
        draft.space.remoteSpaces = {};
      },
      "clearSpaces",
      true,
    );
  },
});

export const partializedSpaceStore = (state: AppStore): SpaceState => ({
  remoteSpaces: state.space.remoteSpaces,
  editableSpaces: state.space.editableSpaces,
  localSpaces: state.space.localSpaces,
});
