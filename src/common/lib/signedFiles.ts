import { blake3 } from "@noble/hashes/blake3";
import { secp256k1 } from "@noble/curves/secp256k1";
import stringify from "fast-json-stable-stringify";
import { isObject } from "lodash";

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

export function isSignedFile(maybeFile: unknown): maybeFile is SignedFile {
  if (!isObject(maybeFile)) {
    return false;
  } else {
    return (
      typeof (maybeFile as SignedFile).fileData === "string" &&
      typeof (maybeFile as SignedFile).fileType === "string" &&
      typeof (maybeFile as SignedFile).isEncrypted === "boolean" &&
      typeof (maybeFile as SignedFile).timestamp === "string" &&
      typeof (maybeFile as SignedFile).publicKey === "string"
    );
  }
}
