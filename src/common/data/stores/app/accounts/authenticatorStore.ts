import { AuthenticatorConfig } from "@/authenticators/AuthenticatorManager";
import { StoreGet, StoreSet } from "../../createStore";
import { AppStore } from "..";
import { debounce, isNull, keys, isEqual } from "lodash";
import { createClient } from "../../../database/supabase/clients/component";
import { authenticatorsPath } from "@/constants/supabase";
import axios from "axios";
import { SignedFile } from "@/common/lib/signedFiles";
import stringify from "fast-json-stable-stringify";
import { AuthenticatorUpdateRequest } from "@/pages/api/space/authenticators";
import axiosBackend from "../../../api/backend";

export interface AuthenticatorState {
  // Local state
  authenticatorConfig: AuthenticatorConfig;
  // Copy of remote state to know what diffs exists
  authenticatorRemoteConfig: AuthenticatorConfig;
}

export interface AuthenticatorActions {
  loadAuthenitcators: () => Promise<void>;
  commitAuthenticatorUpdatesToDatabase: () => Promise<void> | undefined;
  saveAuthenticatorConfig: (newConfig: AuthenticatorConfig) => Promise<void>;
  listInstalledAuthenticators: () => string[];
  resetAuthenticators: () => void;
}

export type AuthenticatorStore = AuthenticatorState & AuthenticatorActions;

export const authenticatorDefaults: AuthenticatorState = {
  authenticatorConfig: {},
  authenticatorRemoteConfig: {},
};

export const authenticatorStore = (
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): AuthenticatorStore => ({
  ...authenticatorDefaults,
  resetAuthenticators: () => {
    set(
      (draft) => {
        draft.account.authenticatorConfig = {};
        draft.account.authenticatorRemoteConfig = {};
      },
      "resetAuthenticators",
      true,
    );
  },
  listInstalledAuthenticators: () => {
    return keys(get().account.authenticatorConfig);
  },
  loadAuthenitcators: async () => {
    const supabase = createClient();
    try {
      const {
        data: { publicUrl },
      } = await supabase.storage
        .from("private")
        .getPublicUrl(
          authenticatorsPath(get().account.currentSpaceIdentityPublicKey!),
        );
      if (publicUrl) {
        const { data }: { data: Blob } = await axios.get(publicUrl, {
          responseType: "blob",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
        if (isNull(data)) {
          console.debug("Could not locate authenticator data");
          return;
        }
        const fileData = JSON.parse(await data.text()) as SignedFile;
        const decryptedFile =
          await get().account.decryptEncryptedSignedFile(fileData);
        const authConfig = JSON.parse(decryptedFile) as AuthenticatorConfig;
        set((draft) => {
          draft.account.authenticatorConfig = authConfig;
          draft.account.authenticatorRemoteConfig = authConfig;
        }, "loadAuthenticators");
      }
    } catch (e) {
      console.debug(e);
      console.debug("Could not locate authenticator data");
    }
  },
  commitAuthenticatorUpdatesToDatabase: debounce(async () => {
    if (
      isEqual(
        get().account.authenticatorConfig,
        get().account.authenticatorRemoteConfig,
      )
    ) {
      // Only update if changes have been made
      return;
    }
    const configFile = await get().account.createEncryptedSignedFile(
      stringify(get().account.authenticatorConfig),
      "json",
    );
    const postData: AuthenticatorUpdateRequest = {
      file: configFile,
      identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
    };

    try {
      await axiosBackend.post("/api/space/authenticators", postData, {
        headers: { "Content-Type": "application/json" },
      });
      set((draft) => {
        draft.account.authenticatorRemoteConfig =
          get().account.authenticatorConfig;
      }, "commitAuthenticatorUpdatesToDatabase");
    } catch (e) {
      console.debug("failed to save authenticator data, trying again");
      get().account.commitAuthenticatorUpdatesToDatabase();
    }
  }, 1000),
  saveAuthenticatorConfig: async (newConfig) => {
    set((draft) => {
      draft.account.authenticatorConfig = newConfig;
    }, "saveAuthenticatorConfig");
    get().account.commitAuthenticatorUpdatesToDatabase();
  },
});

export const partializedAuthenticatorStore = (state: AppStore) => ({
  authenticatorConfig: state.account.authenticatorConfig,
  authenticatorRemoteConfig: state.account.authenticatorRemoteConfig,
});
