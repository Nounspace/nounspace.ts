"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useToken } from "@/common/providers/TokenProvider";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ContractDefinedSpaceProps } from "./ContractDefinedSpace";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import { Address } from 'viem';

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export default function DesktopContractDefinedSpace({
  spaceId,
  tabName,
  contractAddress,
  ownerId,
  ownerIdType,
}: ContractDefinedSpaceProps) {
  const { tokenData } = useToken();
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitialContractSpaceConfigForAddress(
        contractAddress,
        tokenData?.clankerData?.cast_hash || "",
        String(tokenData?.clankerData?.requestor_fid || ""),
        tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "",
        !!tokenData?.clankerData,
        tokenData?.network,
      ),
    [contractAddress, tokenData, tokenData?.network],
  );

  const getSpacePageUrl = (tabName: string) =>
    `/t/${tokenData?.network}/${contractAddress}/${tabName}`;

  // Check if user is signed into Farcaster
  useEffect(() => {
    authManagerGetInitializedAuthenticators().then((authNames) => {
      setIsSignedIntoFarcaster(
        authNames.includes(FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME)
      );
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
        console.log("Current user FID:", currentUserFid, "isSignedIntoFarcaster:", isSignedIntoFarcaster);
      }
    });
  }, [isSignedIntoFarcaster, authManagerLastUpdatedAt]);

  // Convert ownerId to the appropriate type based on ownerIdType
  const spaceOwnerFid = ownerIdType === 'fid' ? Number(ownerId) : undefined;
  const spaceOwnerAddress = ownerIdType === 'address' ? ownerId as Address : undefined;

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