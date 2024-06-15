import { SpaceConfig } from "@/common/ui/templates/Space";
import { AccountStore } from ".";
import { FidgetSettings } from "@/common/fidgets";
import { StoreGet, StoreSet } from "..";
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
type SaveableSpaceConfig = Omit<SpaceConfig, "fidgetConfigs"> & {
  fidgetConfigs: Record<string, FidgetSettings>;
  isPrivate: boolean;
};

interface CachedSpace {
  // Machine generated ID, immutable
  id: SpaceId;
  config: SaveableSpaceConfig;
  updatedAt: string;
}

interface SpaceState {
  spaces: Record<string, CachedSpace>;
  editableSpaces: Record<SpaceId, string>;
  currentSpaceId: string;
  editableSpace?: SaveableSpaceConfig;
}

interface SpaceActions {
  loadSpace: (spaceId: string) => Promise<CachedSpace>;
  registerSpace: (fid: number, name: string) => Promise<string>;
  renameSpace: (spaceId: string, name: string) => Promise<void>;
  loadEditableSpaces: () => Promise<Record<SpaceId, string>>;
  commitCurrentSpaceToDatabase: () => Promise<void>;
  saveSpace: (config: SaveableSpaceConfig) => Promise<void>;
  setCurrentSpace: (spaceId: string) => Promise<void>;
}

export type SpaceStore = SpaceState & SpaceActions;

export const spaceDefault: SpaceState = {
  spaces: {},
  editableSpaces: {},
  currentSpaceId: "",
};

export const spaceStore = (
  set: StoreSet<AccountStore>,
  get: StoreGet<AccountStore>,
): SpaceStore => ({
  ...spaceDefault,
  loadSpace: async (spaceId) => {
    const supabase = createClient();
    const {
      data: { publicUrl },
    } = await supabase.storage.from("spaces").getPublicUrl(spaceId);
    const { data } = await axios.get<Blob>(publicUrl, {
      responseType: "blob",
    });
    const fileData = JSON.parse(await data.text()) as SignedFile;
    const spaceConfig = JSON.parse(
      await get().decryptEncryptedSignedFile(fileData),
    );
    const cachedSpace: CachedSpace = {
      id: spaceId,
      config: spaceConfig,
      updatedAt: moment().toISOString(),
    };
    set((draft) => {
      draft.spaces[spaceId] = cachedSpace;
    });
    return cachedSpace;
  },
  registerSpace: async (fid, name) => {
    const unsignedRegistration: Omit<SpaceRegistration, "signature"> = {
      identityPublicKey: get().currentSpaceIdentityPublicKey,
      spaceName: name,
      timestamp: moment().toISOString(),
      fid,
    };
    const registration = signSignable(
      unsignedRegistration,
      get().getCurrentIdentity()!.rootKeys.privateKey,
    );
    // TO DO: Error handling
    const { data } = await axiosBackend.post<RegisterNewSpaceResponse>(
      "/api/spaces/registry/",
      registration,
    );
    const newSpaceId = data.value!.spaceId;
    set((draft) => {
      draft.editableSpaces[newSpaceId] = name;
    });
    return newSpaceId;
  },
  renameSpace: async (spaceId: string, name: string) => {
    try {
      const unsignedNameRequest: Omit<NameChangeRequest, "signature"> = {
        newName: name,
        publicKey: get().currentSpaceIdentityPublicKey,
        timestamp: moment().toISOString(),
      };
      const signedNameRequest = signSignable(
        unsignedNameRequest,
        get().getCurrentIdentity()!.rootKeys.privateKey,
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
        { params: { identityPublicKey: get().currentSpaceIdentityPublicKey } },
      );
      if (data.value) {
        const editableSpaces = fromPairs(
          map(data.value.spaces, (si) => [si.spaceId, si.spaceName]),
        );
        set((draft) => {
          draft.editableSpaces = editableSpaces;
        });
        return editableSpaces;
      }
      return {};
    } catch (e) {
      console.error(e);
      return {};
    }
  },
  commitCurrentSpaceToDatabase: async () => {
    debounce(async () => {
      const localCopy = get().editableSpace;
      if (localCopy) {
        const file = localCopy.isPrivate
          ? await get().createEncryptedSignedFile(
              stringify(localCopy),
              "json",
              true,
            )
          : await get().createSignedFile(stringify(localCopy), "json");
        // TO DO: Error handling
        await axiosBackend.post(
          `/api/spaces/registry/${get().currentSpaceId}/`,
          {
            config: file,
          },
        );
      }
    })();
  },
  saveSpace: async (config) => {
    set((draft) => {
      draft.editableSpace = config;
    });
  },
  setCurrentSpace: async (spaceId) => {
    set((draft) => {
      draft.currentSpaceId = spaceId;
    });
  },
});

export const partializedSpaceStore = (state: AccountStore) => ({
  spaces: state.spaces,
  editableSpaces: state.editableSpaces,
});
