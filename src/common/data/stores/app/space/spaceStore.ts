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
import {
  DeleteSpaceTabRequest,
  UnsignedDeleteSpaceTabRequest,
} from "@/pages/api/space/registry/[spaceId]/tabs/[tabId]";
import {
  RegisterNewSpaceTabResponse,
  UnsignedSpaceTabRegistration,
} from "@/pages/api/space/registry/[spaceId]/tabs";
import {
  UnsignedUpdateTabOrderRequest,
  UpdateTabOrderRequest,
} from "@/pages/api/space/registry/[spaceId]";

type SpaceId = string;

// SpaceConfig includes all of the Fidget Config
// But a space that is saved in the DB doesn't store
// Fidget data or editablity
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
  ) => Promise<void> | undefined;
  updateLocalSpaceOrder: (spaceId: string, newOrder: string[]) => Promise<void>;
  commitSpaceOrderToDatabase: (spaceId: string) => Promise<void> | undefined;
  registerSpace: (fid: number, name: string) => Promise<string | undefined>;
  clear: () => void;
}

export type SpaceStore = SpaceState & SpaceActions;

export const spaceStoreDefaults: SpaceState = {
  remoteSpaces: {},
  editableSpaces: {},
  localSpaces: {},
};

export const createSpaceStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): SpaceStore => ({
  ...spaceStoreDefaults,
  commitSpaceTabToDatabase: debounce(async (spaceId, tabName) => {
    const localCopy = cloneDeep(get().space.localSpaces[spaceId].tabs[tabName]);
    if (localCopy) {
      const file = await get().account.createEncryptedSignedFile(
        stringify(localCopy),
        "json",
        { useRootKey: true, fileName: tabName },
      );
      try {
        await axiosBackend.post(
          `/api/space/registry/${spaceId}/tabs/${tabName}`,
          file,
        );
        set((draft) => {
          draft.space.remoteSpaces[spaceId].tabs[tabName] = localCopy;
        }, "commitHomebaseToDatabase");
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  }, 1000),
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
      draft.space.localSpaces[spaceId].updatedAt = moment().toISOString();
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
  createSpaceTab: debounce(async (spaceId, tabName) => {
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
        draft.space.localSpaces[spaceId].tabs[tabName] = {
          ...cloneDeep(INITIAL_SPACE_CONFIG_EMPTY),
          isPrivate: false,
        };
        draft.space.localSpaces[spaceId].order.push(tabName);
        return get().space.commitSpaceOrderToDatabase(spaceId);
      }, "createSpaceTab");
    } catch (e) {
      console.error(e);
    }
  }, 1000),
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
        draft.space.remoteSpaces[spaceId].order = cloneDeep(
          get().space.localSpaces[spaceId].order,
        );
      }, "commitSpaceOrderToDatabase");
    } catch (e) {
      console.error(e);
    }
  }, 1000),
  loadSpaceTab: async (spaceId, tabName, fid) => {
    const supabase = createClient();
    try {
      const {
        data: { publicUrl },
      } = await supabase.storage
        .from("spaces")
        .getPublicUrl(`${spaceId}/tabs/${tabName}`);
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
      ) as DatabaseWritableSpaceConfig;
      const currentLocalCopy = get().space.localSpaces[spaceId];
      if (
        (spaceConfig &&
          spaceConfig.timestamp &&
          currentLocalCopy &&
          currentLocalCopy.updatedAt &&
          moment(currentLocalCopy.updatedAt).isAfter(
            moment(spaceConfig.timestamp),
          )) ||
        (spaceConfig &&
          isUndefined(spaceConfig.timestamp) &&
          currentLocalCopy &&
          currentLocalCopy.updatedAt)
      ) {
        console.debug(`local copy of space ${spaceId} config is more recent`);
        return;
      }
      const updatableSpaceConfig = {
        ...spaceConfig,
        isPrivate: fileData.isEncrypted,
      };
      set((draft) => {
        draft.space.remoteSpaces[spaceId].tabs[tabName] = updatableSpaceConfig;
        draft.space.remoteSpaces[spaceId].updatedAt = moment().toISOString();
        draft.space.localSpaces[spaceId].tabs[tabName] =
          cloneDeep(updatableSpaceConfig);
        draft.space.localSpaces[spaceId].updatedAt = moment().toISOString();
      }, "loadSpace");
    } catch (e) {
      console.debug(e);
      const initialSpace = {
        ...(tabName === "default" && fid
          ? createIntialPersonSpaceConfigForFid(fid)
          : INITIAL_SPACE_CONFIG_EMPTY),
        isPrivate: false,
      };
      set((draft) => {
        draft.space.localSpaces[spaceId] = {
          tabs: {
            default: cloneDeep(initialSpace),
          },
          order: ["default"],
          updatedAt: moment().toISOString(),
          changedNames: {},
          id: spaceId,
        };
      }, "loadSpaceTabDefault");
    }
  },
  loadSpaceTabOrder: async (spaceId) => {
    // TO DO: skip if cached copy is recent enough
    try {
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
      const fileData = JSON.parse(await data.text()) as SignedFile;
      const tabOrderReq = JSON.parse(
        await get().account.decryptEncryptedSignedFile(fileData),
      ) as UpdateTabOrderRequest;
      set((draft) => {
        draft.space.localSpaces[spaceId] = {
          tabs: {},
          order: tabOrderReq.tabOrder,
          updatedAt: moment().toISOString(),
          changedNames: {},
          id: spaceId,
        };
      }, "loadSpaceInfo");
    } catch (e) {
      console.debug(e);
      set((draft) => {
        draft.space.localSpaces[spaceId] = {
          tabs: {},
          order: ["default"],
          updatedAt: moment().toISOString(),
          changedNames: {},
          id: spaceId,
        };
      }, "loadSpaceInfoDefault");
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
    // TO DO: Error handling
    try {
      const { data } = await axiosBackend.post<RegisterNewSpaceResponse>(
        "/api/space/registry",
        registration,
      );
      const newSpaceId = data.value!.spaceId;
      set((draft) => {
        draft.space.editableSpaces[newSpaceId] = name;
      }, "registerSpace");
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
