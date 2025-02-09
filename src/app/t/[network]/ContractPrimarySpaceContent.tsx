"use client"

import React from 'react';
import ContractDefinedSpace from '@/common/components/pages/ContractDefinedSpace';
import SpaceNotFound from '@/common/components/pages/SpaceNotFound';
import { useAppStore } from '@/common/data/stores/app';
import { isArray, isNil } from 'lodash';
import { useEffect } from 'react';
import { ContractSpacePageProps } from './[contractAddress]/page';

export const ContractPrimarySpaceContent: React.FC<ContractSpacePageProps> = ({
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
  }, []);

  if (!isNil(ownerId) && !isNil(contractAddress)) {
    if (
      (isNil(spaceId) &&
        (tabName?.toLocaleLowerCase() === "profile" || tabName === null)) ||
      !isNil(spaceId)
    )
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

  return <SpaceNotFound />;
};
