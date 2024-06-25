import { SpaceConfig } from "@/common/components/templates/Space";
import { AppStore } from "..";
import { FidgetInstanceData, FidgetSettings } from "@/common/fidgets";
import { StoreGet, StoreSet } from "../createStore";
import axiosBackend from "../../api/backend";
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
import { createClient } from "../../database/supabase/clients/component";
import axios from "axios";

type SpaceId = string;

// SpaceConfig includes all of the Fidget Config
// But a space that is saved in the DB doesn't store
// Fidget data or editablity
// So we rebuild the details, but without those fields
export type SaveableSpaceConfig = Omit<SpaceConfig, "fidgetConfigs"> & {
  fidgetConfigs: {
    [key: string]: Omit<FidgetInstanceData, "instanceConfig"> & {
      instanceConfig: FidgetSettings;
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
  spaces: Record<string, CachedSpace>;
  editableSpaces: Record<SpaceId, string>;
  editableSpace?: UpdatableSpaceConfig;
}

interface SpaceActions {
  loadSpace: (spaceId: string) => Promise<CachedSpace>;
  registerSpace: (fid: number, name: string) => Promise<string>;
  renameSpace: (spaceId: string, name: string) => Promise<void>;
  loadEditableSpaces: () => Promise<Record<SpaceId, string>>;
  commitSpaceToDatabase: (spaceId: string) => Promise<void>;
  saveSpace: (config: SaveableSpaceConfig) => Promise<void>;
}

export type SpaceStore = SpaceState & SpaceActions;

export const spaceStoreDefaults: SpaceState = {
  spaces: {},
  editableSpaces: {},
};

export const createSpaceStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): SpaceStore => ({
  ...spaceStoreDefaults,
  loadSpace: async (spaceId) => {
    // TO DO: skip if cached copy is recent enough
    const supabase = createClient();
    const {
      data: { publicUrl },
    } = await supabase.storage.from("spaces").getPublicUrl(spaceId);
    const { data } = await axios.get<Blob>(publicUrl, {
      responseType: "blob",
    });
    const fileData = JSON.parse(await data.text()) as SignedFile;
    const spaceConfig = JSON.parse(
      await get().account.decryptEncryptedSignedFile(fileData),
    ) as SaveableSpaceConfig;
    const cachedSpace: CachedSpace = {
      id: spaceId,
      config: {
        ...spaceConfig,
        isPrivate: fileData.isEncrypted,
      },
      updatedAt: moment().toISOString(),
    };
    set((draft) => {
      draft.space.spaces[spaceId] = cachedSpace;
    });
    return cachedSpace;
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
    const { data } = await axiosBackend.post<RegisterNewSpaceResponse>(
      "/api/space/registry/",
      registration,
    );
    const newSpaceId = data.value!.spaceId;
    set((draft) => {
      draft.space.editableSpaces[newSpaceId] = name;
    });
    return newSpaceId;
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
          draft[spaceId] = data.value!.name;
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
      const localCopy = get().space.editableSpace;
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
          config: file,
        });
      }
    }, 1000)();
  },
  saveSpace: async (config) => {
    set((draft) => {
      draft.space.editableSpace = {
        ...config,
        isPrivate: draft.space.editableSpace?.isPrivate || true,
      };
    });
  },
});

export const partializedSpaceStore = (state: AppStore) => ({
  spaces: state.space.spaces,
  editableSpaces: state.space.editableSpaces,
});
