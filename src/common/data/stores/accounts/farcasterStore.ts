import {
  FidLinkToIdentityRequest,
  FidLinkToIdentityResponse,
  FidsLinkedToIdentityResponse,
} from "@/pages/api/fid-link";
import { AccountStore } from ".";
import { StoreGet, StoreSet } from "..";
import axiosBackend from "../../api/backend";
import { concat, isUndefined } from "lodash";
import { hashObject } from "@/common/lib/signedFiles";
import moment from "moment";
import { bytesToHex } from "@noble/ciphers/utils";

type FarcasterActions = {
  getFidsForCurrentIdentity: () => Promise<void>;
  registerFidForCurrentIdentity: (
    fid: number,
    signingKey: string,
    // Takes in signMessage as it is a method
    // of the Authenticator and client doesn't
    // have direct access to the keys
    signMessage: (messageHash: Uint8Array) => Promise<Uint8Array>,
  ) => Promise<void>;
  setFidsForCurrentIdentity: (fids: number[]) => void;
  addFidToCurrentIdentity: (fid: number) => void;
};

export type FarcasterStore = FarcasterActions;

export const farcasterStore = (
  set: StoreSet<AccountStore>,
  get: StoreGet<AccountStore>,
): FarcasterStore => ({
  addFidToCurrentIdentity: (fid) => {
    const currentFids = get().getCurrentIdentity()?.associatedFids || [];
    get().setFidsForCurrentIdentity(concat(currentFids, [fid]));
  },
  setFidsForCurrentIdentity: (fids) => {
    set((draft) => {
      draft.spaceIdentities[draft.getCurrentIdentityIndex()].associatedFids =
        fids;
    });
  },
  getFidsForCurrentIdentity: async () => {
    const { data } = await axiosBackend.get<FidsLinkedToIdentityResponse>(
      "/api/fid-links/",
      { params: { identityPublicKey: get().currentSpaceIdentityPublicKey } },
    );
    if (!isUndefined(data.value)) {
      get().setFidsForCurrentIdentity(data.value!.fids);
    }
  },
  registerFidForCurrentIdentity: async (fid, signingKey, signMessage) => {
    const request: Omit<FidLinkToIdentityRequest, "signature"> = {
      fid,
      identityPublicKey: get().currentSpaceIdentityPublicKey,
      timestamp: moment().toISOString(),
      signingPublicKey: signingKey,
    };
    const signedRequest: FidLinkToIdentityRequest = {
      ...request,
      signature: bytesToHex(await signMessage(hashObject(request))),
    };
    const { data } = await axiosBackend.post<FidLinkToIdentityResponse>(
      "/api/fid-link/",
      signedRequest,
    );
    if (!isUndefined(data.value)) {
      get().addFidToCurrentIdentity(data.value!.fid);
    }
  },
});
