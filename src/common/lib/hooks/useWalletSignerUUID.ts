import { usePrivy } from "@privy-io/react-auth";
import { useAppStore } from "@/common/data/stores/app";
import { find } from "lodash";
import type { Database } from "@/supabase/database";

type WalletIdentity = Database["public"]["Tables"]["walletIdentities"]["Row"];

export const useWalletSignerUUID = (): string | null => {
  const { user, ready } = usePrivy();
  const { walletIdentities, currentSpaceIdentityPublicKey } = useAppStore((state) => ({
    walletIdentities: state.account.walletIdentities,
    currentSpaceIdentityPublicKey: state.account.currentSpaceIdentityPublicKey,
  }));

  if (!ready || !user?.wallet?.address) return null;
  const identities = walletIdentities[user.wallet.address] as WalletIdentity[] | undefined;
  if (!identities) return null;

  const identity = find(identities, { identityPublicKey: currentSpaceIdentityPublicKey }) as
    | WalletIdentity
    | undefined;

  return identity?.id || null;
};

export default useWalletSignerUUID;
