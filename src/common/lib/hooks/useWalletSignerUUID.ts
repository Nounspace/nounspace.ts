import { useWallets } from "@privy-io/react-auth";
import { useAppStore } from "@/common/data/stores/app";

const useWalletSignerUUID = (): string | null => {
  const { wallets } = useWallets();
  const walletIdentities = useAppStore((state) => state.account.walletIdentities);

  if (wallets.length === 0) return null;
  const identities = walletIdentities[wallets[0].address] || [];
  const first = identities[0] as { id?: string } | undefined;
  return first?.id ?? null;
};

export default useWalletSignerUUID;
