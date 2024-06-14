import { blake3 } from "@noble/hashes/blake3";
import { secp256k1 } from "@noble/curves/secp256k1";
import stringify from "fast-json-stable-stringify";

export interface UnsignedFile {
  publicKey: string;
  fileData: string;
  fileType: string;
  isEncrypted: boolean;
  timestamp: string;
}

export type SignedFile = UnsignedFile & {
  signature: string;
};

export type Signable = {
  signature: string;
  publicKey: string;
  [key: string]: any;
};

export function hashObject(obj: object) {
  return blake3(stringify(obj), { dkLen: 256 });
}

export function validateSignable(f: Signable) {
  return secp256k1.verify(
    f.signature,
    hashObject({ ...f, signature: undefined }),
    f.publicKey,
    { prehash: true },
  );
}

export function signFile(
  file: UnsignedFile,
  privateKey: string | Uint8Array,
): SignedFile {
  return {
    ...file,
    signature: secp256k1
      .sign(hashObject(file), privateKey, { prehash: true })
      .toCompactHex(),
  };
}
