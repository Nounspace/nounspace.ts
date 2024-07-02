import { SpaceConfig } from "@/common/components/templates/Space";
import { AppStore } from "..";
import { FidgetConfig, FidgetInstanceData } from "@/common/fidgets";
import { StoreGet, StoreSet } from "../../createStore";
import axiosBackend from "../../../api/backend";
import {
  ModifiableSpacesResponse,
  RegisterNewSpaceResponse,
  SpaceRegistration,
} from "@/pages/api/space/registry";
import { debounce, fromPairs, isUndefined, map } from "lodash";
import {
  NameChangeRequest,
  UpdateSpaceResponse,
} from "@/pages/api/space/registry/[spaceId]";
import moment from "moment";
import { SignedFile, signSignable } from "@/common/lib/signedFiles";
import stringify from "fast-json-stable-stringify";
import { createClient } from "../../../database/supabase/clients/component";
import axios from "axios";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";

type SpaceId = string;

// SpaceConfig includes all of the Fidget Config
// But a space that is saved in the DB doesn't store
// Fidget data or editablity
// So we rebuild the details, but without those fields
export type SaveableSpaceConfig = Omit<
  SpaceConfig,
  "fidgetInstanceDatums" | "isEditable"
> & {
  fidgetInstanceDatums: {
    [key: string]: Omit<FidgetInstanceData, "config"> & {
      config: Omit<FidgetConfig, "data">;
    };
  };
};

export type UpdatableSpaceConfig = SaveableSpaceConfig & {
  isPrivate: boolean;
};

interface CachedSpace {
  // Machine generated ID, immutable
  id: SpaceId;
  config: UpdatableSpaceConfig;
  updatedAt: string;
}

interface SpaceState {
  remoteSpaces: Record<string, CachedSpace>;
  editableSpaces: Record<SpaceId, string>;
  localSpaces: Record<string, UpdatableSpaceConfig>;
}

interface SpaceActions {
  loadSpace: (spaceId: string) => Promise<CachedSpace | null>;
  registerSpace: (fid: number, name: string) => Promise<string | undefined>;
  renameSpace: (spaceId: string, name: string) => Promise<void>;
  loadEditableSpaces: () => Promise<Record<SpaceId, string>>;
  commitSpaceToDatabase: (spaceId: string) => Promise<void>;
  saveLocalSpace: (
    spaceId: string,
    config: UpdatableSpaceConfig,
  ) => Promise<void>;
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
  loadSpace: async (spaceId) => {
    // TO DO: skip if cached copy is recent enough
    try {
      const supabase = createClient();
      const {
        data: { publicUrl },
      } = await supabase.storage.from("spaces").getPublicUrl(spaceId);
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
      ) as SaveableSpaceConfig;
      const updatableSpaceConfig = {
        ...spaceConfig,
        isPrivate: fileData.isEncrypted,
      };
      const cachedSpace: CachedSpace = {
        id: spaceId,
        config: updatableSpaceConfig,
        updatedAt: moment().toISOString(),
      };
      set((draft) => {
        draft.space.remoteSpaces[spaceId] = cachedSpace;
        draft.space.localSpaces[spaceId] = updatableSpaceConfig;
      }, "loadSpace");
      return cachedSpace;
    } catch (e) {
      console.debug(e);
      return null;
    }
  },
  registerSpace: async (fid, name) => {
    const unsignedRegistration: Omit<SpaceRegistration, "signature"> = {
      identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
      spaceName: name,
      timestamp: moment().toISOString(),
      fid,
      isDefault: true,
    };
    const registration = signSignable(
      unsignedRegistration,
      get().account.getCurrentIdentity()!.rootKeys.privateKey,
    );
    // TO DO: Error handling
    try {
      const { data } = await axiosBackend.post<RegisterNewSpaceResponse>(
        "/api/space/registry/",
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
  renameSpace: async (spaceId: string, name: string) => {
    try {
      const unsignedNameRequest: Omit<NameChangeRequest, "signature"> = {
        newName: name,
        publicKey: get().account.currentSpaceIdentityPublicKey!,
        timestamp: moment().toISOString(),
      };
      const signedNameRequest = signSignable(
        unsignedNameRequest,
        get().account.getCurrentIdentity()!.rootKeys.privateKey,
      );
      const { data } = await axiosBackend.post<UpdateSpaceResponse>(
        `/api/space/registry/${spaceId}`,
        {
          name: signedNameRequest,
        },
      );
      if (!isUndefined(data.value) && data.value.name) {
        set((draft) => {
          draft.space.editableSpaces[spaceId] = data.value!.name;
        });
      }
    } catch (e) {
      console.error(e);
      throw new Error("Failed to rename space");
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
        });
        return editableSpaces;
      }
      return {};
    } catch (e) {
      console.error(e);
      return {};
    }
  },
  commitSpaceToDatabase: async (spaceId) => {
    debounce(async () => {
      const localCopy = get().space.localSpaces[spaceId];
      if (localCopy) {
        const file = localCopy.isPrivate
          ? await get().account.createEncryptedSignedFile(
              stringify({
                ...localCopy,
                isPrivate: undefined,
              }),
              "json",
              true,
            )
          : await get().account.createSignedFile(
              stringify({ ...localCopy, isPrivate: undefined }),
              "json",
            );
        // TO DO: Error handling
        await axiosBackend.post(`/api/space/registry/${spaceId}/`, {
          spaceConfig: file,
        });

        analytics.track(AnalyticsEvent.SAVE_SPACE_THEME);

        set((draft) => {
          draft.space.remoteSpaces[spaceId] = {
            id: spaceId,
            config: localCopy,
            updatedAt: moment().toISOString(),
          };
        });
      }
    }, 1000)();
  },
  saveLocalSpace: async (spaceId, config) => {
    set((draft) => {
      draft.space.localSpaces[spaceId] = config;
    });
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
