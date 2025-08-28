import requestHandler from "@/common/data/api/requestHandler";
import axios, { isAxiosError } from "axios";
import { createHash } from "crypto";
import { NobleEd25519Signer } from "@farcaster/core";
import type { NextApiRequest, NextApiResponse } from "next";

function base64url(input: string | Uint8Array) {
  return Buffer.from(input).toString("base64url");
}

async function makeAppKeyBearer(
  fid: number,
  privHex: string,
  pubHex: string,
) {
  const header = { fid, type: "app_key", key: pubHex };
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
  };
  const body = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload),
  )}`;
  const signer = new NobleEd25519Signer(
    Buffer.from(privHex.replace(/^0x/, ""), "hex"),
  );
  const hash = createHash("sha256").update(body).digest();
  const sigResult = await signer.signMessageHash(hash);
  if (sigResult.isErr()) {
    throw sigResult.error;
  }
  return `Bearer ${body}.${base64url(sigResult.value)}`;
}

async function getAppKey(fid: number) {
  const privHex = process.env.NOUNSPACE_APP_KEY_PRIV_HEX;
  const pubHex = process.env.NOUNSPACE_APP_KEY_PUB_HEX;
  if (!privHex || !pubHex) return null;
  return { privHex, pubHex };
}

async function proxy(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { channelId, fid, useServerAuth } = req.body as {
      channelId?: string;
      fid?: number;
      useServerAuth?: boolean;
    };
    let authHeader = req.headers.authorization;
    if (!authHeader && useServerAuth && typeof fid === "number") {
      const keypair = await getAppKey(fid);
      if (keypair) {
        authHeader = await makeAppKeyBearer(fid, keypair.privHex, keypair.pubHex);
      }
    }
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json("Missing or invalid Authorization header");
      return;
    }
    if (!channelId || typeof channelId !== "string") {
      res.status(400).json("channelId is required");
      return;
    }
    const url = "https://api.farcaster.xyz/fc/channel-follows";
    const headers = {
      Authorization: authHeader,
      "Content-Type": "application/json",
    };
    const method = req.method?.toUpperCase() || "POST";
    let response;
    if (method === "POST") {
      response = await axios.post(url, { channelId }, { headers });
    } else {
      response = await axios.delete(url, { headers, data: { channelId } });
    }
    res.status(200).json(response.data);
  } catch (e) {
    if (isAxiosError(e)) {
      console.error(req.method, e.response?.status, e.response?.data);
      res
        .status(e.response?.status || 500)
        .json(e.response?.data || "An unknown error occurred");
    } else {
      console.error(req.method, e);
      res.status(500).json("An unknown error occurred");
    }
  }
}

export default requestHandler({
  post: proxy,
  delete: proxy,
});

