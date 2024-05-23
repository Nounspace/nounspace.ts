import { ConnectedWallet } from "@privy-io/react-auth";
import { SignableMessage, createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

export async function getWalletClient(wallet: ConnectedWallet) {
  const provider = await wallet.getEthereumProvider();
  await wallet.switchChain(base.id);
  return createWalletClient({
    chain: base,
    transport: custom(provider),
  });
}

export async function signMessage(wallet: ConnectedWallet, message: SignableMessage) {
  return (await getWalletClient(wallet)).signMessage({ account: wallet.address as `0x${string}`, message });
}