"use client";

import React, { useMemo } from "react";
import { useToken } from "@/common/providers/TokenProvider";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ContractDefinedSpaceProps } from "./ContractDefinedSpace";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import { Address } from "viem";

export default function DesktopContractDefinedSpace({
  spaceId,
  tabName,
  contractAddress,
  ownerId,
  ownerIdType,
}: ContractDefinedSpaceProps) {
  const { tokenData } = useToken();
  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitialContractSpaceConfigForAddress(
        contractAddress,
        tokenData?.clankerData?.cast_hash || "",
        String(tokenData?.clankerData?.requestor_fid || ""),
        tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "",
        !!tokenData?.clankerData,
        tokenData?.network
      ),
    [contractAddress, tokenData, tokenData?.network]
  );

  const getSpacePageUrl = (tabName: string) => `/t/${tokenData?.network}/${contractAddress}/${tabName}`;

  // Convert ownerId to the appropriate type based on ownerIdType
  const spaceOwnerFid = ownerIdType === "fid" ? Number(ownerId) : undefined;
  const spaceOwnerAddress = ownerIdType === "address" ? (ownerId as Address) : undefined;

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
