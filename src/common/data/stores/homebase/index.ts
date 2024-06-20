import { StoreGet, StoreSet } from "../createStore";
import { AppStore } from "..";
import { SaveableSpaceConfig } from "../accounts/spaceStore";
import axios from "axios";
import { createClient } from "../../database/supabase/clients/component";
import { homebasePath } from "@/constants/supabase";
import { SignedFile } from "@/common/lib/signedFiles";
import { debounce } from "lodash";
import stringify from "fast-json-stable-stringify";
import axiosBackend from "../../api/backend";

interface HomeBaseStoreState {
  homebaseConfig?: SaveableSpaceConfig;
}

interface HomeBaseStoreActions {
  loadHomebase: () => Promise<SaveableSpaceConfig>;
  commitHomebaseToDatabase: () => Promise<void>;
  saveHomebaseConfig: (config: SaveableSpaceConfig) => Promise<void>;
}

export type HomeBaseStore = HomeBaseStoreState & HomeBaseStoreActions;

const HomeBaseStoreDefaults: HomeBaseStoreState = {};

export const createHomeBaseStoreFunc = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): HomeBaseStore => ({
  ...HomeBaseStoreDefaults,
  loadHomebase: async () => {
    const supabase = createClient();
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("private")
      .getPublicUrl(homebasePath(get().account.currentSpaceIdentityPublicKey!));
    const { data } = await axios.get<Blob>(publicUrl, {
      responseType: "blob",
    });
    const fileData = JSON.parse(await data.text()) as SignedFile;
    const spaceConfig = JSON.parse(
      await get().account.decryptEncryptedSignedFile(fileData),
    ) as SaveableSpaceConfig;
    set((draft) => {
      draft.homebase.homebaseConfig = spaceConfig;
    });
    return spaceConfig;
  },
  commitHomebaseToDatabase: async () => {
    debounce(async () => {
      const localCopy = get().homebase.homebaseConfig;
      if (localCopy) {
        const file = await get().account.createEncryptedSignedFile(
          stringify(localCopy),
          "json",
          true,
        );
        // TO DO: Error handling
        await axiosBackend.post(
          `/api/space/registry/${get().account.currentSpaceId}/`,
          {
            config: file,
          },
        );
      }
    })();
  },
  saveHomebaseConfig: async (config) => {
    set((draft) => {
      draft.homebase.homebaseConfig = config;
    });
  },
});
