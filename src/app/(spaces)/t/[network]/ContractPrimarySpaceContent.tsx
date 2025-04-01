"use client"

import React from 'react';
import ContractDefinedSpace from '@/app/(spaces)/t/[network]/ContractDefinedSpace';
import SpaceNotFound from '@/app/(spaces)/SpaceNotFound';
import { useAppStore } from '@/common/data/stores/app';
import { isArray, isNil } from 'lodash';
import { useEffect } from 'react';
import { ContractSpacePageProps } from './[contractAddress]/page';

const ContractPrimarySpaceContent: React.FC<ContractSpacePageProps> = ({
  spaceId,
  tabName,
  ownerId,
  ownerIdType,
  contractAddress,
  owningIdentities,
  network,
}) => {
  console.log('ContractPrimarySpaceContent rendered with props:', {
    spaceId,
    tabName,
    ownerId,
    ownerIdType,
    contractAddress,
    network,
    owningIdentitiesLength: owningIdentities?.length
  });

  const { loadEditableSpaces, addContractEditableSpaces } = useAppStore(
    (state) => ({
      loadEditableSpaces: state.space.loadEditableSpaces,
      addContractEditableSpaces: state.space.addContractEditableSpaces,
    }),
  );

  useEffect(() => {
    console.log('Effect: Adding contract editable spaces for spaceId:', spaceId);
    addContractEditableSpaces(spaceId, owningIdentities);
  }, [spaceId]);

  useEffect(() => {
    console.log('Effect: Loading editable spaces');
    loadEditableSpaces();
  }, []);

  // Log the conditions that determine rendering
  const hasOwnerAndContract = !isNil(ownerId) && !isNil(contractAddress);
  const shouldShowProfile = isNil(spaceId) && (tabName?.toLocaleLowerCase() === "profile" || tabName === null);
  const hasSpaceId = !isNil(spaceId);

  console.log('Rendering conditions:', {
    hasOwnerAndContract,
    shouldShowProfile,
    hasSpaceId,
    willRenderSpace: hasOwnerAndContract && (shouldShowProfile || hasSpaceId)
  });

  if (hasOwnerAndContract) {
    if (shouldShowProfile || hasSpaceId) {
      console.log('Rendering ContractDefinedSpace with props:', {
        ownerId,
        ownerIdType,
        spaceId,
        tabName: isArray(tabName) ? tabName[0] : tabName ?? "Profile",
        contractAddress
      });
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
    }
  }

  console.log('Rendering SpaceNotFound because:', {
    hasOwnerAndContract,
    shouldShowProfile,
    hasSpaceId,
    ownerId,
    contractAddress,
    spaceId,
    tabName
  });
  return <SpaceNotFound />;
};

export default ContractPrimarySpaceContent;
