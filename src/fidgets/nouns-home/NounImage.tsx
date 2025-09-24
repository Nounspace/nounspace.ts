'use client';

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { nounsPublicClient, NOUNS_IMAGE_SOURCE, NOUNS_TOKEN_ADDRESS } from "./config";
import { NounsTokenAbi } from "./abis";

type Props = {
  nounId: bigint | number;
  className?: string;
  priority?: boolean;
};

const resolveTokenUriImage = async (nounId: bigint) => {
  try {
    const tokenUri = await nounsPublicClient.readContract({
      address: NOUNS_TOKEN_ADDRESS,
      abi: NounsTokenAbi,
      functionName: "tokenURI",
      args: [nounId],
    });

    if (typeof tokenUri !== "string") return null;

    if (tokenUri.startsWith("data:application/json;base64,")) {
      const [, base64] = tokenUri.split(",");
      const json = JSON.parse(atob(base64));
      if (typeof json.image === "string") {
        return json.image as string;
      }
    }

    if (tokenUri.startsWith("data:application/json;utf8,")) {
      const json = JSON.parse(tokenUri.split(",")[1] ?? "{}");
      if (typeof json.image === "string") {
        return json.image as string;
      }
    }

    return tokenUri;
  } catch (error) {
    console.error("Failed to load Noun tokenURI", error);
    return null;
  }
};

const nounPicsUrl = (nounId: bigint) =>
  `https://noun.pics/api/noun/${nounId.toString()}`;

const cloudNounsUrl = (nounId: bigint) =>
  `https://api.cloudnouns.com/v1/pfp?seed=${nounId.toString()}&background=0`;

const NounImage: React.FC<Props> = ({ nounId, className, priority }) => {
  const nounIdBigInt = BigInt(nounId);

  const { data: tokenImage, isLoading } = useQuery({
    queryKey: ["noun-image", nounIdBigInt.toString(), NOUNS_IMAGE_SOURCE],
    queryFn: async () => {
      switch (NOUNS_IMAGE_SOURCE) {
        case "noun.pics":
          return nounPicsUrl(nounIdBigInt);
        case "cloudnouns":
          return cloudNounsUrl(nounIdBigInt);
        case "tokenURI":
        default:
          return resolveTokenUriImage(nounIdBigInt);
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  const alt = `Noun ${nounIdBigInt.toString()}`;

  if (isLoading && NOUNS_IMAGE_SOURCE === "tokenURI") {
    return (
      <div
        className={`flex items-center justify-center bg-muted/40 ${className ?? ""}`}
        aria-busy="true"
        aria-label="Loading noun artwork"
      >
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!tokenImage) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/40 ${className ?? ""}`}
        aria-label="Artwork unavailable"
      >
        <span className="text-xs text-muted-foreground">Artwork unavailable</span>
      </div>
    );
  }

  const isDataUri = tokenImage.startsWith("data:");

  return (
    <img
      src={tokenImage}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      aria-hidden={false}
      style={{ imageRendering: isDataUri ? "pixelated" : "auto" }}
    />
  );
};

export default NounImage;
