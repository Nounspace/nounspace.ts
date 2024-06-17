import { FidsLinkedToIdentityResponse } from "@/pages/api/fid-link";
import { AccountStore } from ".";
import { StoreGet, StoreSet } from "..";
import axiosBackend from "../../api/backend";
import { isUndefined } from "lodash";

type FarcasterActions = {
  getFidsForCurrentIdentity: () => Promise<void>;
  registerFidForCurrentIdentity: (fid: number) => Promise<void>;
};

export type FarcasterStore = FarcasterActions;

export const farcasterStore = (
  set: StoreSet<AccountStore>,
  get: StoreGet<AccountStore>,
): FarcasterStore => ({
  getFidsForCurrentIdentity: async () => {
    const { data } = await axiosBackend.get<FidsLinkedToIdentityResponse>(
      "/api/fid-links/",
      { params: { identityPublicKey: get().currentSpaceIdentityPublicKey } },
    );
    if (!isUndefined(data.value)) {
      set((draft) => {
        draft.spaceIdentities[draft.getCurrentIdentityIndex()].associatedFids =
          data.value!.fids;
      });
    }
  },
  registerFidForCurrentIdentity: async (fid) => {},
});
