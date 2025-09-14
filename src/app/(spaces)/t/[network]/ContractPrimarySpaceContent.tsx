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
  network,
}) => {
  const [spaceId, setSpaceId] = useState(initialSpaceId);
  const [isLoading, setIsLoading] = useState(true);

  const { setCurrentSpaceId } = useAppStore(
    (state) => ({
      setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
    })
  );

  useEffect(() => {
    const fetchSpaceIdForContract = async () => {
      if (!initialSpaceId && contractAddress && network) {
        try {
          const response = await axios.get(
            "/api/space/registry",
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
  }, [initialSpaceId, contractAddress, network, setCurrentSpaceId]);

  // The editabilityChecker now handles adding to editableSpaces directly

  if (isNil(contractAddress)) {
    return <SpaceNotFound />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-screen">
        <Spinner />
      </div>
    );
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
