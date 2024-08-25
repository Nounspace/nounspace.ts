export function rootKeyPath(identityPublicKey: string, walletAddress: string) {
  return `${identityPublicKey}/keys/root/${walletAddress}`;
}

export function preKeysPath(identityPublicKey: string) {
  return `${identityPublicKey}/keys/pre/`;
}

export function authenticatorsPath(identityPublicKey: string) {
  return `${identityPublicKey}/authenticators`;
}

export function homebasePath(identityPublicKey: string) {
  return `${identityPublicKey}/homebase`;
}

export function homebaseTabOrderPath(key: string) {
  return `${homebasePath(key)}TabOrder`;
}
