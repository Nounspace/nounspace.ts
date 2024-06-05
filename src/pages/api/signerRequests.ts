import { APP_FID } from "@/constants/app";
import { AppSigner } from "@/constants/app-server-side";
import { NOGS_CONTRACT_ADDR } from "@/constants/nogs";
import { ALCHEMY_API, WARPCAST_API } from "@/constants/urls";
import { SIGNED_KEY_REQUEST_TYPE, SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN } from "@farcaster/core";
import axios from "axios";
import { isArray, isUndefined } from "lodash";
import type { NextApiRequest, NextApiResponse } from 'next';

type CreateSignerRequest = {
  publicKey: `0x${string}`;
  requestingWallet?: `0x${string}`;
};

export type SignerResponse<D> = {
  result: "success" | "error";
  error?: {
    message: string;
  };
  value?: D;
};

type SignedKeyRequestSponsorship = {
  sponsorFid: number;
  signature: string; // sponsorship signature by sponsorFid
}

type SignedKeyRequestBody = {
  key: string;
  requestFid: number;
  deadline: number;
  signature: string; // key request signature by requestFid
  sponsorship?: SignedKeyRequestSponsorship;
}

export type SignedKeyRequestResponse = {
  token: string;
  deeplinkUrl: string;
  isSponsored: boolean;
  key: `0x${string}`;
  state: "pending" | "completed" | "approved";
  requestFid: number;
};

type SignedKeyRequestResponseBody = {
  result: {
    signedKeyRequest: SignedKeyRequestResponse;
  };
};

type AlchemyIsHolderOfContract = {
  isHolderOfContract: boolean;
};

async function handlePost(req: NextApiRequest, res: NextApiResponse<SignerResponse<SignedKeyRequestResponse>>) {
  const { publicKey, requestingWallet } = req.body as CreateSignerRequest;

  if (isUndefined(publicKey)) {
    return res.status(400).json({
      result: "error",
      error: {
        message: "No Public Key Provided",
      },
    });
  }

  const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
  const signature = await AppSigner.signTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: "SignedKeyRequest",
    message: {
      requestFid: BigInt(APP_FID!),
      key: publicKey,
      deadline: BigInt(deadline),
    },
  });

  let shouldSponsor = false;
  if (!isUndefined(requestingWallet)) {
    try {
      const { data } = await axios.get<AlchemyIsHolderOfContract>(
        `${ALCHEMY_API("base")}nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/isHolderOfContract`,
        {
          params: {
            wallet: requestingWallet,
            contractAddress: NOGS_CONTRACT_ADDR,
          }
        }
      );
      shouldSponsor = data.isHolderOfContract;
    } catch (e) {
      console.error(e);
      console.log("Failed to check ")
    }
  }

  let sponsorship: SignedKeyRequestSponsorship | undefined = undefined;
  if (shouldSponsor) {
    sponsorship = {
      sponsorFid: APP_FID!,
      signature: await AppSigner.signMessage({ message: { raw: signature }}),
    };
  }

  try {
    const requestArgs: SignedKeyRequestBody = {
      key: publicKey,
      requestFid: APP_FID!,
      signature,
      deadline,
      sponsorship,
    };
    const { data } = await axios.post<SignedKeyRequestResponseBody>(`${WARPCAST_API}/v2/signed-key-requests`, requestArgs);

    return res.status(200).json({
      result: "success",
      value: data.result.signedKeyRequest,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      result: "error",
      error: {
        message: "An error occurred registering the signer with Neynar",
      },
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<SignerResponse<SignedKeyRequestResponse>>) {
  const token = req.query.token;

  if (isUndefined(token)) {
    return res.status(400).json({
      result: "error",
      error: {
        message: "No token Provided",
      },
    });
  }

  if (isArray(token)) {
    return res.status(400).json({
      result: "error",
      error: {
        message: "Only provide a single token",
      },
    });
  }

  try {
    const { data } = await axios.get<SignedKeyRequestResponseBody>(`${WARPCAST_API}/v2/signed-key-request`, {
      params: {
        token,
      },
    });

    return res.status(200).json({
      result: "success",
      value: data.result.signedKeyRequest,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      result: "error",
      error: {
        message: "An error occurred registering the signer with Neynar",
      },
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignerResponse<SignedKeyRequestResponse>>
) {
  if (req.method === "POST") {
    return handlePost(req, res);
  } else if (req.method === "GET") {
    return handleGet(req, res);
  } else {
    res.status(405).json({
      result: "error",
      error: {
        message: "Only GET and POST are allowed",
      }
    });
  }
}