import {
  ConnectedWallet,
  User as PrivyUser,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import type { AppStore } from "..";
import { StoreSet } from "../../createStore";
import { find, isUndefined } from "lodash";
import { signMessage as signExternalWalletMessage } from "@/common/lib/wallets";
import { useMemo } from "react";

interface PrivyState {
  privyUser?: PrivyUser | null;
}

interface PrivyActions {
  setPrivyUser: (user: PrivyUser) => void;
}

export type PrivyStore = PrivyActions & PrivyState;

export const privyDefault: PrivyState = {
  privyUser: null,
};

class WalletNotConnectedError extends Error {
  constructor(message = "Wallet is not connected", ...args) {
    super(message, ...args);
  }
}

export type SignMessageFunctionSignature = (
  wallet: Partial<ConnectedWallet>,
  message: string,
) => Promise<string>;

export function useSignMessage() {
  const { signMessage: signPrivyWalletMessage, ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  async function signMessage(
    wallet: Partial<ConnectedWallet>,
    message: string,
  ) {
    if (wallet.walletClientType === "privy") {
      const { signature } = await signPrivyWalletMessage({
        message,
      });
      return signature;
    } else {
      const connectedWallet = find(
        wallets,
        (w) => w.address === wallet.address,
      );
      if (isUndefined(connectedWallet)) {
        throw WalletNotConnectedError;
      } else {
        return signExternalWalletMessage(connectedWallet, message);
      }
    }
  }

  const ready = useMemo(
    () => privyReady && walletsReady,
    [privyReady, walletsReady],
  );

  return { signMessage, ready };
}

export const privyStore = (set: StoreSet<AppStore>): PrivyStore => ({
  ...privyDefault,
  setPrivyUser: (user: PrivyUser) => {
    set((draft) => {
      draft.account.privyUser = user;
    }, "setPrivyUser");
  },
});

export const partializedPrivyStore = (_state: AppStore) => ({});
