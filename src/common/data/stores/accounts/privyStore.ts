import {
  ConnectedWallet,
  User as PrivyUser,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import type { AccountStore } from ".";
import { StoreSet } from "..";
import { find, isUndefined } from "lodash";
import { signMessage as signExternalWalletMessage } from "@/common/lib/wallets";
import { useEffect, useState } from "react";

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
  const [ready, setReady] = useState(false);

  async function signMessage(
    wallet: Partial<ConnectedWallet>,
    message: string,
  ) {
    if (wallet.walletClientType === "privy") {
      return signPrivyWalletMessage(message);
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

  useEffect(() => {
    if (walletsReady && privyReady) {
      setReady(true);
    }
  }, [walletsReady, privyReady]);

  return { signMessage, ready };
}

export const privyStore = (set: StoreSet<AccountStore>): PrivyStore => ({
  ...privyDefault,
  setPrivyUser: (user: PrivyUser) => {
    set((draft) => {
      draft.privyUser = user;
    });
  },
});

export const partializedPrivyStore = (_state: AccountStore) => ({});
