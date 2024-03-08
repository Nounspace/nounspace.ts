import * as ed from "@noble/ed25519"
import { NobleEd25519Signer, SIGNED_KEY_REQUEST_TYPE, SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN, bytesToHexString } from "@farcaster/hub-web";
import { toBytes } from 'viem'
import { mnemonicToAccount } from "viem/accounts";
import axios from "axios";

type KeyPairType = {
  publicKey: Uint8Array,
  privateKey: Uint8Array
}

type WarpcastLoginType = {
  token: string,
  deeplinkUrl: string
}

type WarpcastSignerType = {
  publicKey: `0x${string}`,
  privateKey: `0x${string}`,
  signature: string,
  requestFid: number,
  deadline: number
}

export enum WarpcastLoginStatus {
  pending = "pending",
  success = "success",
  failure = "failure"
}

const APP_FID = process.env.NEXT_PUBLIC_APP_FID
const APP_MNENOMIC = process.env.NEXT_PUBLIC_APP_MNENOMIC

const WARPCAST_API_ENDPOINT = 'https://api.warpcast.com/v2/';
const headers = { "Content-Type": "application/json", };

export const generateKeyPair = async (): Promise<KeyPairType> => {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);

  return { publicKey, privateKey };
}

export const createSignerRequest = async (publicKey: string, requestFid: number, signature: string, deadline: number): Promise<WarpcastLoginType> => {
  const payload = {
    key: publicKey,
    requestFid,
    signature,
    deadline,
  }

  const { token, deeplinkUrl } = await axios
    .post(`${WARPCAST_API_ENDPOINT}signed-key-requests`, payload)
    .then((response) => response.data.result.signedKeyRequest);

  return { deeplinkUrl, token };
}

const getSignerRequestStatus = async (signerToken: string) => {
  console.log('getSignerRequestStatus', signerToken);
  const data = await (await fetch(`${WARPCAST_API_ENDPOINT}signed-key-request?token=${signerToken}`, { headers })).json();
  return data.result.signedKeyRequest;
}

const generateWarpcastSigner = async (): Promise<WarpcastSignerType> => {
  const { publicKey, privateKey } = await generateKeyPair();
  const hexStringPublicKey = bytesToHexString(publicKey)._unsafeUnwrap() as `0x${string}`;
  const hexStringPrivateKey = bytesToHexString(privateKey)._unsafeUnwrap() as `0x${string}`;

  const appAccount = mnemonicToAccount(APP_MNENOMIC!);
  const requestFid = APP_FID;
  const deadline = Math.floor(Date.now() / 1000) + 86400; // signature is valid for 1 day
  const signature = await appAccount.signTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: "SignedKeyRequest",
    message: {
      requestFid: BigInt(requestFid!),
      key: hexStringPublicKey as `0x${string}`,
      deadline: BigInt(deadline),
    },
  });

  return { publicKey: hexStringPublicKey, privateKey: hexStringPrivateKey, signature, requestFid, deadline };
}

const getWarpcastSignerStatus = async (signerToken: string): Promise<{ status: WarpcastLoginStatus, data: any }> => {
  const data = await getSignerRequestStatus(signerToken);
  const status = data && (data.state === 'approved' || data.state === 'completed') ? WarpcastLoginStatus.success : WarpcastLoginStatus.pending;
  return { status, data: data }
}

const getWarpcastSigner = async (privateKey: string) => {
  const privateKeyEncoded = toBytes(privateKey);
  return new NobleEd25519Signer(privateKeyEncoded);
}

export { generateWarpcastSigner, getWarpcastSigner, getWarpcastSignerStatus };
