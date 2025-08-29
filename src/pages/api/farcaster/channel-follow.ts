import requestHandler from "@/common/data/api/requestHandler";
import axios, { isAxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { NobleEd25519Signer } from "@farcaster/hub-nodejs";
import { blake3 } from "@noble/hashes/blake3";

function toBase64Url(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64url(obj: unknown) {
  return toBase64Url(Buffer.from(JSON.stringify(obj)));
}

async function makeAppKeyBearer(fid: number, privHex: string, pubHex: string) {
  const priv = privHex.replace(/^0x/, "");
  const pub = pubHex.replace(/^0x/, "");
  const signer = new NobleEd25519Signer(new Uint8Array(Buffer.from(priv, "hex")));

  const header = { fid, type: "app_key", key: pub };
  const payload = { exp: Math.floor(Date.now() / 1000) + 300 }; // 5 min
  const h = b64url(header);
  const p = b64url(payload);

  // Sign the BLAKE3 hash of "h.p" as required by Warpcast
  const toSign = blake3(Buffer.from(`${h}.${p}`, "utf-8"));
  const sigRes = await signer.signMessageHash(toSign);
  if (sigRes.isErr()) throw sigRes.error;
  const s = toBase64Url(Buffer.from(sigRes.value));

  return `Bearer ${h}.${p}.${s}`;
}

// TODO: replace with real keystore lookup: return the app key registered for this fid.
// For now, return env values (works only if that app key is registered to the current fid).
async function getAppKeyForFid(fid: number): Promise<{ privHex: string; pubHex: string } | null> {
  const privHex = process.env.NOUNSPACE_APP_KEY_PRIV_HEX;
  const pubHex = process.env.NOUNSPACE_APP_KEY_PUB_HEX;
  if (!privHex || !pubHex) return null;
  return { privHex, pubHex };
}

async function proxy(req: NextApiRequest, res: NextApiResponse) {
  try {
    const method = (req.method || "POST").toUpperCase();
    const { channelId, fid, useServerAuth } = (req.body || {}) as {
      channelId?: string; fid?: number; useServerAuth?: boolean;
    };
    if (!channelId || typeof channelId !== "string") {
      res.status(400).json("channelId is required"); return;
    }

    // 1) Determine Authorization
    let authHeader = req.headers.authorization;
    if ((!authHeader || !authHeader.startsWith("Bearer ")) && useServerAuth && typeof fid === "number") {
      const kp = await getAppKeyForFid(fid);
      if (!kp) { res.status(401).json("No app key available for fid"); return; }
      authHeader = await makeAppKeyBearer(fid, kp.privHex, kp.pubHex);
    }
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json("Missing or invalid Authorization header"); return;
    }

    // 2) Forward request
    const url = "https://api.farcaster.xyz/fc/channel-follows";
    const headers = { Authorization: authHeader, "Content-Type": "application/json" };
    const response =
      method === "POST"
        ? await axios.post(url, { channelId }, { headers })
        : await axios.delete(url, { headers, data: { channelId } });

    res.status(200).json(response.data);
  } catch (e) {
    if (isAxiosError(e)) {
      console.error(req.method, e.response?.status, e.response?.data);
      res.status(e.response?.status || 500).json(e.response?.data || "An unknown error occurred");
    } else {
      console.error(req.method, e);
      res.status(500).json("An unknown error occurred");
    }
  }
}

export default requestHandler({ post: proxy, delete: proxy });
