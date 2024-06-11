import { AuthenticatorConfig } from "@/authenticators/AuthenticatorManager";
import { StoreGet, StoreSet } from "..";
import { AccountStore } from ".";
import { debounce, isNull } from "lodash";
import { createClient } from "../../database/supabase/clients/component";
import { authenticatorsPath } from "@/constants/supabase";
import axios from "axios";
import { SignedFile } from "@/common/lib/signedFiles";
import stringify from "fast-json-stable-stringify";
import { AuthenticatorUpdateRequest } from "@/pages/api/space/authenticators";
import axiosBackend from "../../api/backend";

export interface AuthenticatorState {
  // Local state
  authenticatorConfig: AuthenticatorConfig;
  // Copy of remote state to know what diffs exists
  authenticatorRemoteConfig: AuthenticatorConfig;
}

export interface AuthenticatorActions {
  loadAuthenitcators: () => Promise<void>;
  commitAuthenticatorUpdatesToDatabase: () => Promise<void>;
  saveAuthenticatorConfig: (newConfig: AuthenticatorConfig) => Promise<void>;
}

export type AuthenticatorStore = AuthenticatorState & AuthenticatorActions;

export const authenticatorDefaults: AuthenticatorState = {
  authenticatorConfig: {},
  authenticatorRemoteConfig: {},
};

export const authenticatorStore = (
  set: StoreSet<AccountStore>,
  get: StoreGet<AccountStore>,
): AuthenticatorStore => ({
  ...authenticatorDefaults,
  loadAuthenitcators: async () => {
    const supabase = createClient();
    const {
      data: { publicUrl },
    } = await supabase.storage
      .from("private")
      .getPublicUrl(authenticatorsPath(get().currentSpaceIdentityPublicKey));
    if (publicUrl) {
      const { data }: { data: Blob } = await axios.get(publicUrl, {
        responseType: "blob",
      });
      if (isNull(data)) {
        console.debug("Could not locate authenticator data");
        return;
      }
      const fileData = JSON.parse(await data.text()) as SignedFile;
      const authConfig = JSON.parse(
        await get().decryptEncryptedSignedFile(fileData),
      ) as AuthenticatorConfig;
      set((draft) => {
        draft.authenticatorConfig = authConfig;
        draft.authenticatorRemoteConfig = authConfig;
      });
    } else {
      console.debug("Could not locate authenticator data");
    }
  },
  commitAuthenticatorUpdatesToDatabase: async () => {
    debounce(async () => {
      if (get().authenticatorConfig === get().authenticatorRemoteConfig) {
        // Only update if changes have been made
        return;
      }
      const configFile = await get().createEncryptedSignedFile(
        stringify(get().authenticatorConfig),
        "json",
        true,
      );
      const postData: AuthenticatorUpdateRequest = {
        file: configFile,
        identityPublicKey: get().currentSpaceIdentityPublicKey,
      };

      try {
        await axiosBackend.post("/api/space/authenticators/", postData, {
          headers: { "Content-Type": "application/json" },
        });
        set((draft) => {
          draft.authenticatorRemoteConfig = get().authenticatorConfig;
        });
      } catch (e) {
        console.debug("failed to save authenticator data, trying again");
        get().commitAuthenticatorUpdatesToDatabase();
      }
    }, 1000)();
  },
  saveAuthenticatorConfig: async (newConfig) => {
    set((draft) => {
      draft.authenticatorConfig = newConfig;
    });
    get().commitAuthenticatorUpdatesToDatabase();
  },
});
