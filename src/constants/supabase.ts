export function rootKeyPath(identityPublicKey: string, walletAddress: string) {
  return `${identityPublicKey}/keys/root/${walletAddress}`;
}

export function preKeysPath(identityPublicKey: string) {
  return `${identityPublicKey}/keys/pre/`;
}
