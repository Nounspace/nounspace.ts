"use client";

import React from "react";
import ContractDefinedSpace from "@/app/(spaces)/t/[network]/ContractDefinedSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { useAppStore } from "@/common/data/stores/app";
import { isArray, isNil } from "lodash";
import { useEffect } from "react";
import { ContractSpacePageProps } from "./[contractAddress]/page";

const ContractPrimarySpaceContent: React.FC<ContractSpacePageProps> = ({
  spaceId,
  tabName,
  ownerId,
  ownerIdType,
  contractAddress,
  owningIdentities,
  network,
  tokenData,
}) => {
  console.log("ContractPrimarySpaceContent received props:", {
    spaceId,
    tabName,
    ownerId,
    ownerIdType,
    contractAddress,
    owningIdentities,
    network,
  });

  const {
    loadEditableSpaces,
    addContractEditableSpaces,
    registerSpaceContract,
  } = useAppStore((state) => ({
    loadEditableSpaces: state.space.loadEditableSpaces,
    addContractEditableSpaces: state.space.addContractEditableSpaces,
    registerSpaceContract: state.space.registerSpaceContract,
  }));

  useEffect(() => {
    if (spaceId) {
      console.log("addContractEditableSpaces called with:", {
        spaceId,
        owningIdentities,
      });
      addContractEditableSpaces(spaceId, owningIdentities);
    }
  }, [spaceId, owningIdentities, addContractEditableSpaces]);

  useEffect(() => {
    console.log("loadEditableSpaces called");
    loadEditableSpaces();

    console.log("ContractPrimarySpaceContent rendered with props:", {
      spaceId,
      tabName,
      ownerId,
      ownerIdType,
      contractAddress,
      owningIdentities,
      network,
    });
  }, [loadEditableSpaces]);

  // Log the conditions that determine rendering
  const hasOwnerAndContract = !isNil(ownerId) && !isNil(contractAddress);
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
  if (isNil(contractAddress)) {
    console.log("Returning SpaceNotFound due to missing contractAddress");
    return <SpaceNotFound />;
  }

  // If we have a contract address, show the space even if it doesn't exist yet
  console.log("Rendering ContractDefinedSpace with spaceId:", spaceId);
  return (
    <>
      <ContractDefinedSpace
        ownerId={ownerId}
        ownerIdType={ownerIdType}
        spaceId={spaceId}
        tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
        contractAddress={contractAddress}
      />
    </>
  );
};

export default ContractPrimarySpaceContent;
