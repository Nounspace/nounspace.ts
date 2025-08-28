import requestHandler from "@/common/data/api/requestHandler";
import axios, { isAxiosError } from "axios";
import { NobleEd25519Signer } from "@farcaster/hub-nodejs";
import type { NextApiRequest, NextApiResponse } from "next";

function b64url(obj: unknown) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

async function makeAppKeyBearer(
  fid: number,
  privHex: string,
  pubHex: string,
) {
  const signer = new NobleEd25519Signer(
    new Uint8Array(Buffer.from(privHex.replace(/^0x/, ""), "hex")),
  );

  const header = { fid, type: "app_key", key: pubHex.replace(/^0x/, "") };
  const encodedHeader = b64url(header);

  const payload = { exp: Math.floor(Date.now() / 1000) + 300 };
  const encodedPayload = b64url(payload);

  const toSign = Buffer.from(`${encodedHeader}.${encodedPayload}`, "utf-8");
  const sig = await signer.signMessageHash(toSign);
  if (sig.isErr()) throw sig.error;

  const encodedSig = Buffer.from(sig.value).toString("base64url");
  return `Bearer ${encodedHeader}.${encodedPayload}.${encodedSig}`;
}

async function getAppKeyForFid(fid: number) {
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

    if (!channelId || typeof channelId !== "string") {
      res.status(400).json("channelId is required");
      return;
    }

    let authHeader = req.headers.authorization;
    if (
      (!authHeader || !authHeader.startsWith("Bearer ")) &&
      useServerAuth &&
      typeof fid === "number"
    ) {
      const keypair = await getAppKeyForFid(fid);
      if (!keypair) {
        res.status(401).json("No app key available for fid");
        return;
      }
      authHeader = await makeAppKeyBearer(fid, keypair.privHex, keypair.pubHex);
    }
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json("Missing or invalid Authorization header");
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

