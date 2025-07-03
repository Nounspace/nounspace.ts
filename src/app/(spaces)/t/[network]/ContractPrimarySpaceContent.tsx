"use client";

import React, { useState } from "react";
import ContractDefinedSpace from "@/app/(spaces)/t/[network]/ContractDefinedSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { useAppStore } from "@/common/data/stores/app";
import { isArray, isNil } from "lodash";
import { useEffect } from "react";
import { ContractSpacePageProps } from "./[contractAddress]/page";
import axios from "axios";
import Spinner from "@/common/components/atoms/spinner";

const ContractPrimarySpaceContent: React.FC<ContractSpacePageProps> = ({
  spaceId: initialSpaceId,
  tabName,
  ownerId,
  ownerIdType,
  contractAddress,
  owningIdentities,
  network,
}) => {
  const [spaceId, setSpaceId] = useState(initialSpaceId);
  const [isLoading, setIsLoading] = useState(true);

  const { addContractEditableSpaces, setCurrentSpaceId } = useAppStore(
    (state) => ({
      addContractEditableSpaces: state.space.addContractEditableSpaces,
      setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    })
  );

  useEffect(() => {
    const fetchSpaceIdForContract = async () => {
      if (!spaceId && contractAddress && network) {
        try {
          const response = await axios.get(
            "/api/space/registry/from-contract",
            {
              params: { contractAddress, network },
            }
          );
          if (
            response.data.result === "success" &&
            response.data.value.spaceId
          ) {
            const fetchedSpaceId = response.data.value.spaceId;
            setSpaceId(fetchedSpaceId);
            setCurrentSpaceId(fetchedSpaceId);
          }
        } catch (error) {
          // It's okay if it fails, means no space is registered yet.
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchSpaceIdForContract();
  }, [spaceId, contractAddress, network, setCurrentSpaceId]);

  useEffect(() => {
    if (spaceId) {
      addContractEditableSpaces(spaceId, owningIdentities);
    }
  }, [spaceId, owningIdentities, addContractEditableSpaces]);

  if (isNil(contractAddress)) {
    return <SpaceNotFound />;
  }

  if (isLoading) {
    return <Spinner />;
  }

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
