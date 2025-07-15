"use client";

import React, { useEffect, useState } from "react";
import ProposalDefinedSpace, { ProposalPageSpaceProps } from "./ProposalDefinedSpace";
import axios from "axios";
import Spinner from "@/common/components/atoms/spinner";
import { useAppStore } from "@/common/data/stores/app";
import { isArray } from "lodash";

interface ProposalPrimarySpaceContentProps extends ProposalPageSpaceProps {}

const ProposalPrimarySpaceContent: React.FC<ProposalPrimarySpaceContentProps> = ({
  spaceId: initialSpaceId,
  tabName,
  proposalId,
  proposalData,
}) => {
  const [spaceId, setSpaceId] = useState(initialSpaceId);
  const [isLoading, setIsLoading] = useState(true);

  const { setCurrentSpaceId } = useAppStore((state) => ({
    setCurrentSpaceId: state.currentSpace.setCurrentSpaceId,
  }));

  useEffect(() => {
    const fetchSpaceIdForProposal = async () => {
      if (!initialSpaceId && proposalId) {
        try {
          const response = await axios.get("/api/space/registry", {
            params: { proposalId },
          });
          if (response.data.result === "success" && response.data.value.spaceId) {
            const fetched = response.data.value.spaceId as string;
            setSpaceId(fetched);
            setCurrentSpaceId(fetched);
          }
        } catch {
          // ignore - space might not exist yet
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchSpaceIdForProposal();
  }, [initialSpaceId, proposalId, setCurrentSpaceId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <ProposalDefinedSpace
      spaceId={spaceId}
      tabName={isArray(tabName) ? tabName[0] : tabName ?? "Profile"}
      proposalId={proposalId}
      proposalData={proposalData}
    />
  );
};

export default ProposalPrimarySpaceContent;
