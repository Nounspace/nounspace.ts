import { blake3 } from "@noble/hashes/blake3";
import { ed25519 } from "@noble/curves/ed25519";
import stringify from "fast-json-stable-stringify";
import { isObject } from "lodash";
import { bytesToHex } from "@noble/ciphers/utils";

export interface UnsignedFile {
  publicKey: string;
  fileData: string;
  fileType: string;
  isEncrypted: boolean;
  timestamp: string;
  fileName?: string;
}

export type SignedFile = UnsignedFile & {
  signature: string;
};

export type Signable = {
  signature: string;
  [key: string]: any;
};

export function hashObject(obj: object) {
  return blake3(stringify(obj), { dkLen: 256 });
}

export function isSignable(
  maybe: unknown,
  publicKeyVariableName = "publicKey",
): maybe is Signable {
  if (!isObject(maybe)) {
    return false;
  }
  return (
    publicKeyVariableName in maybe &&
    typeof maybe[publicKeyVariableName] === "string" &&
    typeof maybe["signature"] === "string"
  );
}

export function validateSignable(
  f: Signable,
  publicKeyVariableName = "publicKey",
) {
  return ed25519.verify(
    f.signature,
    hashObject({ ...f, signature: undefined }),
    f[publicKeyVariableName],
  );
}

export function signSignable<S extends object = object>(
  signable: S,
  privateKey: string | Uint8Array,
): Signable & S {
  return {
    ...signable,
    signature: bytesToHex(ed25519.sign(hashObject(signable), privateKey)),
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
