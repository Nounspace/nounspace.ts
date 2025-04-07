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

  const { loadEditableSpaces, addContractEditableSpaces } = useAppStore(
    (state) => ({
      loadEditableSpaces: state.space.loadEditableSpaces,
      addContractEditableSpaces: state.space.addContractEditableSpaces,
    }),
  );

  useEffect(() => {
    addContractEditableSpaces(spaceId, owningIdentities);
  }, [spaceId]);

  useEffect(() => {
    loadEditableSpaces();

    console.log('ContractPrimarySpaceContent rendered with props:', {
      spaceId,
      tabName,
      ownerId,
      ownerIdType,
      contractAddress,
      owningIdentities,
      network,
    });
  }, []);

  // Log the conditions that determine rendering
  const hasOwnerAndContract = !isNil(ownerId) && !isNil(contractAddress);
  const shouldShowProfile = isNil(spaceId) && (tabName?.toLocaleLowerCase() === "profile" || tabName === null);
  const hasSpaceId = !isNil(spaceId);

  if (hasOwnerAndContract) {
    if (shouldShowProfile || hasSpaceId) {
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

  return <SpaceNotFound />;
};

export default ContractPrimarySpaceContent;
