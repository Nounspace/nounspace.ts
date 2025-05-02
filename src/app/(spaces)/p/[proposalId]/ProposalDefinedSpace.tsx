"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ProposalData } from "@/fidgets/community/nouns-dao";

export interface ProposalPageSpaceProps {
  spaceId?: string | null;
  tabName?: string | null;
  proposalId: string | null;
  ownerId?: string | null;
  proposalData?: ProposalData;
  owningIdentities?: string[];
}
const ProposalDefinedSpace = (props: ProposalPageSpaceProps) => {
  return (
    <div className="w-full">
      <DynamicDesktopContractDefinedSpace {...props} />
    </div>
  );
};

const DynamicDesktopContractDefinedSpace = dynamic(
  () => import("./DesktopProposalDefinedSpace"),
  { ssr: false }
);

export default ProposalDefinedSpace;
