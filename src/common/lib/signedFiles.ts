import { blake3 } from "@noble/hashes/blake3";
import { secp256k1 } from "@noble/curves/secp256k1";
import stringify from "fast-json-stable-stringify";

export interface UnsignedFile {
  publicKey: string;
  fileData: string;
  fileType: string;
  isEncrypted: boolean;
}

export type SignedFile = UnsignedFile & {
  signature: string;
};

export function hashObject(obj: object) {
  return blake3(stringify(obj), { dkLen: 256 });
}

export function validateFileSignature(f: SignedFile) {
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
