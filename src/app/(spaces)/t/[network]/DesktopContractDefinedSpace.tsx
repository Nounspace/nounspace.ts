"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useToken } from "@/common/providers/TokenProvider";
import { useWallets } from "@privy-io/react-auth";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ContractDefinedSpaceProps } from "./ContractDefinedSpace";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import { Address } from "viem";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export default function DesktopContractDefinedSpace({
  spaceId,
  tabName,
  contractAddress,
  ownerId,
  ownerIdType,
}: ContractDefinedSpaceProps) {
  const { tokenData } = useToken();
  const { wallets } = useWallets();
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  const INITIAL_SPACE_CONFIG = useMemo(() => {
    const config = createInitialContractSpaceConfigForAddress(
      contractAddress,
      tokenData?.clankerData?.cast_hash || "",
      String(tokenData?.clankerData?.requestor_fid || ""),
      tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "",
      !!tokenData?.clankerData,
      tokenData?.network
    );
    console.log("[DesktopContractDefinedSpace] INITIAL_SPACE_CONFIG", config);
    return config;
  }, [contractAddress, tokenData, tokenData?.network]);

  const getSpacePageUrl = (tabName: string) => {
    const url = `/t/${tokenData?.network}/${contractAddress}/${tabName}`;
    console.log("[DesktopContractDefinedSpace] getSpacePageUrl", url);
    return url;
  };

  // Check if user is signed into Farcaster
  useEffect(() => {
    authManagerGetInitializedAuthenticators().then((authNames) => {
      setIsSignedIntoFarcaster(authNames.includes(FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME));
    });
  }, [authManagerLastUpdatedAt]);

  // Get current user's FID
  useEffect(() => {
    if (!isSignedIntoFarcaster) return;
    authManagerCallMethod({
      requestingFidgetId: "root",
      authenticatorId: FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME,
      methodName: "getAccountFid",
      isLookup: true,
    }).then((authManagerResp) => {
      if (authManagerResp.result === "success") {
        setCurrentUserFid(authManagerResp.value as number);
      }
    });
  }, [isSignedIntoFarcaster, authManagerLastUpdatedAt]);

  // Convert ownerId to the appropriate type based on ownerIdType
  const spaceOwnerFid = ownerIdType === "fid" ? Number(ownerId) : undefined;
  const spaceOwnerAddress = ownerIdType === "address" ? (ownerId as Address) : undefined;

  console.log("[DesktopContractDefinedSpace] render", {
    spaceId,
    tabName,
    contractAddress,
    ownerId,
    ownerIdType,
    INITIAL_SPACE_CONFIG,
    tokenData,
  });
  return (
    <PublicSpace
      spaceId={spaceId}
      tabName={tabName}
      initialConfig={INITIAL_SPACE_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      isTokenPage={true}
      contractAddress={contractAddress}
      spaceOwnerFid={spaceOwnerFid}
      spaceOwnerAddress={spaceOwnerAddress}
      tokenData={tokenData || undefined}
    />
  );
}
