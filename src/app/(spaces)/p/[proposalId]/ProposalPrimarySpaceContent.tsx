"use client";

import React, { useEffect } from "react";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { useAppStore } from "@/common/data/stores/app";
import { isArray, isNil } from "lodash";
import ProposalDefinedSpace from "./ProposalDefinedSpace";
import { ProposalPageSpaceProps } from "./ProposalDefinedSpace";

const ProposalPrimarySpaceContent: React.FC<ProposalPageSpaceProps> = ({
  spaceId,
  tabName,
  proposalId,
  ownerId,
  proposalData,
  owningIdentities,
}) => {
  console.log("ProposalPrimarySpaceContent received props:", {
    spaceId,
    tabName,
    ownerId,
    proposalId,
    proposalData,
    owningIdentities,
  });

  const {
    loadEditableSpaces,
    addProposalEditableSpaces,
    registerProposalSpace,
  } = useAppStore((state) => ({
    loadEditableSpaces: state.space.loadEditableSpaces,
    addProposalEditableSpaces: state.space.addProposalEditableSpaces,
    registerProposalSpace: state.space.registerProposalSpace,
  }));

  useEffect(() => {
    console.log("addContractEditableSpaces called with:", {
      spaceId,
      owningIdentities,
    });
    addProposalEditableSpaces(spaceId, owningIdentities ?? []);
  }, [spaceId]);

  useEffect(() => {
    console.log("loadEditableSpaces called");
    loadEditableSpaces();

    console.log("ContractPrimarySpaceContent rendered with props:", {
      spaceId,
      tabName,
      ownerId,
    });
  }, []);

  // Log the conditions that determine rendering
  const hasOwnerAndContract = !isNil(ownerId) && !isNil(proposalId);
  const shouldShowProfile =
    isNil(spaceId) &&
    (tabName?.toLocaleLowerCase() === "profile" || tabName === null);
  const hasSpaceId = !isNil(spaceId);

  console.log("Rendering conditions:", {
    hasOwnerAndContract,
    shouldShowProfile,
    hasSpaceId,
    currentSpaceId: spaceId,
  });

  // Only show 404 if we don't have a valid contract address
  if (isNil(proposalId) && isNil(spaceId)) {
    console.log("Returning SpaceNotFound due to missing proposalId or spaceId");
    return <SpaceNotFound />;
  }

  return (
    <>
      <ProposalDefinedSpace
        ownerId={ownerId}
        spaceId={spaceId}
        tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
        proposalId={proposalId}
      />
    </>
  );
};

export default ProposalPrimarySpaceContent;
