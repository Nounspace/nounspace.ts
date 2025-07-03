"use client";

import React, { useState } from "react";
import ContractDefinedSpace from "@/app/(spaces)/t/[network]/ContractDefinedSpace";
import SpaceNotFound from "@/app/(spaces)/SpaceNotFound";
import { useAppStore } from "@/common/data/stores/app";
import { isArray, isNil } from "lodash";
import { useEffect } from "react";
import { ContractSpacePageProps } from "./[contractAddress]/page";
import axios from "axios";

const ContractPrimarySpaceContent: React.FC<ContractSpacePageProps> = ({
  spaceId: initialSpaceId,
  tabName,
  ownerId,
  ownerIdType,
  contractAddress,
  owningIdentities,
  network,
  tokenData,
}) => {
  const [spaceId, setSpaceId] = useState(initialSpaceId);

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
          const response = await axios.get("/api/space/registry/from-contract", {
            params: { contractAddress, network },
          });
          if (
            response.data.result === "success" &&
            response.data.value.spaceId
          ) {
            const fetchedSpaceId = response.data.value.spaceId;
            console.log("Successfully fetched spaceId:", fetchedSpaceId);
            setSpaceId(fetchedSpaceId);
            setCurrentSpaceId(fetchedSpaceId);
          }
        } catch (error) {
          console.log("No existing space found for this contract, proceeding...");
        }
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
