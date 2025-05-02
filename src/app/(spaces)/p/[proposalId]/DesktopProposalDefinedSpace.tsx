"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAuthenticatorManager } from "@/authenticators/AuthenticatorManager";
import PublicSpace from "@/app/(spaces)/PublicSpace";
import { Address } from "viem";
import { ProposalPageSpaceProps } from "./ProposalDefinedSpace";
import createInitalProposalSpaceConfigForProposalId from "@/constants/initialProposalSpace";

const FARCASTER_NOUNSPACE_AUTHENTICATOR_NAME = "farcaster:nounspace";

export default function DesktopProposalDefinedSpace({
  spaceId,
  tabName,
  proposalId,
  ownerId,
  proposalData,
  owningIdentities,
}: ProposalPageSpaceProps) {
  const [isSignedIntoFarcaster, setIsSignedIntoFarcaster] = useState(false);
  const [currentUserFid, setCurrentUserFid] = useState<number | null>(null);

  const {
    lastUpdatedAt: authManagerLastUpdatedAt,
    getInitializedAuthenticators: authManagerGetInitializedAuthenticators,
    callMethod: authManagerCallMethod,
  } = useAuthenticatorManager();

  const INITIAL_SPACE_CONFIG = useMemo(
    () =>
      createInitalProposalSpaceConfigForProposalId(
        proposalId as Address,
        ownerId as Address
      ),
    [proposalId]
  );

  const getSpacePageUrl = (tabName: string) => `/p/${proposalId}/${tabName}`;

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
      }
    });
  }, [isSignedIntoFarcaster, authManagerLastUpdatedAt]);

  // Convert ownerId to the appropriate type based on ownerIdType

  return (
    <PublicSpace
      spaceId={spaceId || ""} // Ensure spaceId is a string
      tabName={tabName || ""} // Ensure tabName is a string
      initialConfig={INITIAL_SPACE_CONFIG}
      getSpacePageUrl={getSpacePageUrl}
      isTokenPage={false}
      spaceOwnerFid={1}
      spaceOwnerAddress={
        ownerId?.startsWith("0x") ? (ownerId as `0x${string}`) : undefined
      } // Ensure spaceOwnerAddress matches the expected type
      tokenData={undefined}
      pageType="proposal"
    />
  );
}
