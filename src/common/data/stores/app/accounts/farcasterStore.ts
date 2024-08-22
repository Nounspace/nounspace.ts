import {
  FidLinkToIdentityRequest,
  FidLinkToIdentityResponse,
  FidsLinkedToIdentityResponse,
} from "@/pages/api/fid-link";
import { AppStore } from "..";
import { StoreGet, StoreSet } from "../../createStore";
import axiosBackend from "../../../api/backend";
import { concat, isUndefined } from "lodash";
import { hashObject } from "@/common/lib/signedFiles";
import moment from "moment";
import { bytesToHex } from "@noble/ciphers/utils";
import {
  analytics,
  AnalyticsEvent,
} from "@/common/providers/AnalyticsProvider";

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
  set: StoreSet<AppStore>,
  get: StoreGet<AppStore>,
): FarcasterStore => ({
  addFidToCurrentIdentity: (fid) => {
    const currentFids =
      get().account.getCurrentIdentity()?.associatedFids || [];
    get().account.setFidsForCurrentIdentity(concat(currentFids, [fid]));
  },
  setFidsForCurrentIdentity: (fids) => {
    set((draft) => {
      draft.account.spaceIdentities[
        draft.account.getCurrentIdentityIndex()
      ].associatedFids = fids;
    }, "setFidsForCurrentIdentity");
  },
  getFidsForCurrentIdentity: async () => {
    const { data } = await axiosBackend.get<FidsLinkedToIdentityResponse>(
      "/api/fid-link",
      {
        params: {
          identityPublicKey: get().account.currentSpaceIdentityPublicKey,
        },
      },
    );
    if (!isUndefined(data.value)) {
      get().account.setFidsForCurrentIdentity(data.value!.fids);
    }
  },
  registerFidForCurrentIdentity: async (fid, signingKey, signMessage) => {
    const request: Omit<FidLinkToIdentityRequest, "signature"> = {
      fid,
      identityPublicKey: get().account.currentSpaceIdentityPublicKey!,
      timestamp: moment().toISOString(),
      signingPublicKey: signingKey,
    };
    const signedRequest: FidLinkToIdentityRequest = {
      ...request,
      signature: bytesToHex(await signMessage(hashObject(request))),
    };
    const { data } = await axiosBackend.post<FidLinkToIdentityResponse>(
      "/api/fid-link",
      signedRequest,
    );
    if (!isUndefined(data.value)) {
      get().account.addFidToCurrentIdentity(data.value!.fid);
      analytics.track(AnalyticsEvent.LINK_FID, { fid });
    }
  },
});
