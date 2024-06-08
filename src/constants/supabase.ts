export function rootKeyPath(identityPublicKey: string, walletAddress: string) {
  return `${identityPublicKey}/keys/root/${walletAddress}`;
}
