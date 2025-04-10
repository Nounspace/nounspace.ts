"use client";

import React, { useMemo } from "react";
import { useToken } from "@/common/providers/TokenProvider";
import { useWallets } from "@privy-io/react-auth";
import { toString } from "lodash";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ContractDefinedSpaceProps } from "./ContractDefinedSpace";


export default function DesktopContractDefinedSpace({
  spaceId,
  tabName,
  contractAddress,
  ownerId,
  ownerIdType,
}: ContractDefinedSpaceProps) {
  const { tokenData } = useToken();
  const tokenNetwork = tokenData?.network;

  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitialContractSpaceConfigForAddress(
        contractAddress,
        tokenData?.clankerData?.cast_hash || "",
        String(tokenData?.clankerData?.requestor_fid || ""),
        tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "",
        !!tokenData?.clankerData,
        tokenNetwork,
      ),
    [contractAddress, tokenData, tokenData?.network],
  );

  const getSpacePageUrl = (tabName: string) => 
    `/t/${tokenData?.network}/${contractAddress}/${tabName}`;

  return (
    <PublicSpace
      spaceId={spaceId}
      tabName={tabName}
      initialConfig={INITIAL_SPACE_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      isTokenPage={true}
      contractAddress={contractAddress}
      ownerId={String(ownerId || "")}
      ownerIdType={ownerIdType}
      tokenData={tokenData || undefined}
    />
  );
}