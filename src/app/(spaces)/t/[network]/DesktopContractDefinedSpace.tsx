"use client";

import React from "react";
import { useToken } from "@/common/providers/TokenProvider";
import { useWallets } from "@privy-io/react-auth";
import { toString, find, isNil } from "lodash";
import createInitialContractSpaceConfigForAddress from "@/constants/initialContractSpace";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { ContractDefinedSpaceProps } from "./ContractDefinedSpace";
import useCurrentFid from "@/common/lib/hooks/useCurrentFid";

export default function DesktopContractDefinedSpace({
  spaceId,
  tabName,
  contractAddress,
  ownerId,
  ownerIdType,
}: ContractDefinedSpaceProps) {
  const { tokenData } = useToken();
  const tokenNetwork = tokenData?.network;
  const { wallets } = useWallets();
  const currentUserFid = useCurrentFid();

  const INITIAL_SPACE_CONFIG = createInitialContractSpaceConfigForAddress(
    contractAddress,
    tokenData?.clankerData?.cast_hash || "",
    String(tokenData?.clankerData?.requestor_fid || ""),
    tokenData?.clankerData?.symbol || tokenData?.geckoData?.symbol || "",
    !!tokenData?.clankerData,
    tokenNetwork,
  );

  const getSpacePageUrl = (tabName: string) => 
    `/t/${tokenData?.network}/${contractAddress}/${tabName}`;

  // Determine if the current user can edit this space
  const isEditable = (() => {
    if (!currentUserFid) return false;

    // Check if user is the requestor
    if (parseInt(toString(tokenData?.clankerData?.requestor_fid) || "") === currentUserFid) {
      return true;
    }

    // Check if user is the owner
    if (ownerIdType === "fid" && (toString(ownerId) === toString(currentUserFid) || Number(ownerId) === currentUserFid)) {
      return true;
    }

    // Check if user owns the wallet address
    if (ownerIdType === "address" && !isNil(find(wallets, (w) => w.address === ownerId))) {
      return true;
    }

    return false;
  })();

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
      isEditable={isEditable}
    />
  );
}