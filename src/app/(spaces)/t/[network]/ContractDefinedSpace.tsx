"use client";

import React from "react";
import { OwnerType } from "@/common/data/api/etherscan";
import dynamic from "next/dynamic";

export interface ContractDefinedSpaceProps {
  spaceId: string | null;
  tabName: string;
  contractAddress: string;
  pinnedCastId?: string;
  ownerId: string | number | null;
  ownerIdType: OwnerType;
}

const ContractDefinedSpace = (props: ContractDefinedSpaceProps) => {
  return (
    <div className="w-full">
      <DynamicDesktopContractDefinedSpace {...props} />
    </div>
  );
};

const DynamicDesktopContractDefinedSpace = dynamic(() => import("./DesktopContractDefinedSpace"), { ssr: false });

export default ContractDefinedSpace;
